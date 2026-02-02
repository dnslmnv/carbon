import os
from typing import List, Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError, EndpointConnectionError


def _parse_origins(raw: Optional[str]) -> List[str]:
    if not raw:
        return []
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def ensure_minio_bucket() -> None:
    """
    Ensure the target MinIO bucket exists and has a basic CORS policy so browser uploads work.
    Non-fatal: logs and returns on errors to avoid blocking app startup.
    """

    endpoint = os.getenv("MINIO_ENDPOINT", "http://minio:9000")
    access_key = os.getenv("MINIO_ACCESS_KEY")
    secret_key = os.getenv("MINIO_SECRET_KEY")
    use_ssl = os.getenv("MINIO_USE_SSL", "False").lower() in ("1", "true", "yes")
    bucket = os.getenv("MINIO_BUCKET", "files")
    region = os.getenv("MINIO_REGION", "us-east-1")

    # Prefer dedicated CORS list, fall back to CORS_ALLOWED_ORIGINS for convenience
    cors_origins = _parse_origins(
        os.getenv(
            "MINIO_CORS_ALLOWED_ORIGINS",
            os.getenv("CORS_ALLOWED_ORIGINS", ""),
        )
    )

    if not access_key or not secret_key:
        print("MinIO setup skipped: MINIO_ACCESS_KEY or MINIO_SECRET_KEY not set")
        return

    session = boto3.session.Session()
    try:
        s3 = session.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
            use_ssl=use_ssl,
        )
    except (BotoCoreError, EndpointConnectionError) as exc:
        print(f"MinIO setup: error creating client: {exc}")
        return

    try:
        s3.head_bucket(Bucket=bucket)
        bucket_exists = True
    except ClientError as exc:
        error_code = int(exc.response.get("Error", {}).get("Code", 0) or 0)
        if error_code == 404:
            bucket_exists = False
        else:
            print(f"MinIO setup: error checking bucket: {exc}")
            return
    except (BotoCoreError, EndpointConnectionError) as exc:
        print(f"MinIO setup: error checking bucket: {exc}")
        return

    if not bucket_exists:
        try:
            # MinIO typically ignores LocationConstraint; safe to send region for S3 compat.
            params = {"Bucket": bucket}
            if region and region != "us-east-1":
                params["CreateBucketConfiguration"] = {"LocationConstraint": region}
            s3.create_bucket(**params)
            print(f"MinIO setup: created bucket '{bucket}'")
        except (BotoCoreError, ClientError, EndpointConnectionError) as exc:
            print(f"MinIO setup: error creating bucket '{bucket}': {exc}")
            return

    if cors_origins:
        try:
            s3.put_bucket_cors(
                Bucket=bucket,
                CORSConfiguration={
                    "CORSRules": [
                        {
                            "AllowedOrigins": cors_origins,
                            "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
                            "AllowedHeaders": ["*"],
                            "ExposeHeaders": ["ETag"],
                            "MaxAgeSeconds": 3600,
                        }
                    ]
                },
            )
            print(f"MinIO setup: applied CORS for {cors_origins}")
        except (BotoCoreError, ClientError, EndpointConnectionError) as exc:
            print(f"MinIO setup: error setting CORS: {exc}")
    else:
        print("MinIO setup: no CORS origins configured; skipping CORS")


if __name__ == "__main__":
    ensure_minio_bucket()
