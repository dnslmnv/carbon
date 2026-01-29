from celery import shared_task


@shared_task
def echo_filename(name: str) -> str:
    return f"received {name}"
