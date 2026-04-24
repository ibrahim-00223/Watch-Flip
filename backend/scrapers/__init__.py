import asyncio
import random

from scrapers.leboncoin import scrape_leboncoin
from scrapers.vinted import scrape_vinted
from scrapers.chrono24 import scrape_chrono24

__all__ = ["scrape_leboncoin", "scrape_vinted", "scrape_chrono24", "random_delay"]


async def random_delay():
    await asyncio.sleep(random.uniform(2, 5))
