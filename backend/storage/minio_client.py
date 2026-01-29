import os
import re
import uuid
from typing import Optional

import boto3
from botocore.client import Config

_FILENAME_SAFE_RE = re.compile(r"[^A-Za-z0-9._-]+")


def get_s3_client(endpoint_override: Optional[str] = None):
    endpoint = endpoint_override or os.getenv("MINIO_ENDPOINT", "http://minio:9000")
    access_key = os.getenv("MINIO_ACCESS_KEY")
    secret_key = os.getenv("MINIO_SECRET_KEY")
    region = os.getenv("MINIO_REGION", "us-east-1")
    use_ssl = os.getenv("MINIO_USE_SSL", "False").lower() in ("1", "true", "yes")

    session = boto3.session.Session()
    return session.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=region,
        use_ssl=use_ssl,
        config=Config(signature_version="s3v4"),
    )


def bucket_name() -> str:
    return os.getenv("MINIO_BUCKET", "files")


def make_object_key(filename: str) -> str:
    safe_name = _FILENAME_SAFE_RE.sub("-", filename).strip("-") or "file"
    return f"{uuid.uuid4()}-{safe_name}"


def presigned_put_url(
    key: str, content_type: Optional[str] = None, expires_in: int = 900
) -> str:
    public_endpoint = os.getenv("MINIO_PUBLIC_ENDPOINT")
    client = get_s3_client(endpoint_override=public_endpoint)
    params = {"Bucket": bucket_name(), "Key": key}
    if content_type:
        params["ContentType"] = content_type
    url = client.generate_presigned_url(
        ClientMethod="put_object",
        Params=params,
        ExpiresIn=expires_in,
    )
    return url


def presigned_get_url(key: str, expires_in: int = 900) -> str:
    public_endpoint = os.getenv("MINIO_PUBLIC_ENDPOINT")
    client = get_s3_client(endpoint_override=public_endpoint)
    url = client.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": bucket_name(), "Key": key},
        ExpiresIn=expires_in,
    )
    return url
