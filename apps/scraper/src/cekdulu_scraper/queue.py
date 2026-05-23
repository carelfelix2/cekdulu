from __future__ import annotations

import json
from collections.abc import AsyncIterator

import aio_pika
from aio_pika.abc import AbstractIncomingMessage

from .settings import settings


class QueueClient:
    def __init__(self) -> None:
        self._connection: aio_pika.RobustConnection | None = None
        self._channel: aio_pika.abc.AbstractChannel | None = None

    async def connect(self) -> None:
        if self._connection is None:
            self._connection = await aio_pika.connect_robust(settings.queue_url)
            self._channel = await self._connection.channel()
            await self._channel.set_qos(prefetch_count=settings.concurrency)

    async def close(self) -> None:
        if self._connection is not None:
            await self._connection.close()
            self._connection = None
            self._channel = None

    async def publish(self, routing_key: str, payload: dict) -> None:
        await self.connect()
        assert self._channel is not None
        message = aio_pika.Message(body=json.dumps(payload, default=lambda value: getattr(value, 'value', str(value))).encode(), delivery_mode=aio_pika.DeliveryMode.PERSISTENT)
        await self._channel.default_exchange.publish(message, routing_key=routing_key)

    async def consume(self, queue_name: str) -> AsyncIterator[AbstractIncomingMessage]:
        await self.connect()
        assert self._channel is not None
        queue = await self._channel.declare_queue(queue_name, durable=True)
        async with queue.iterator() as iterator:
            async for message in iterator:
                yield message


queue_client = QueueClient()
