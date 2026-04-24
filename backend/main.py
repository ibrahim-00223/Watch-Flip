import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from apscheduler.triggers.interval import IntervalTrigger

from database import engine, Base
from routers import collection, flips, alertes, veille
from scheduler import scheduler, run_alertes_job


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Start scheduler
    scheduler.add_job(
        run_alertes_job,
        trigger=IntervalTrigger(hours=24),
        id="alertes_job",
        replace_existing=True,
    )
    scheduler.start()

    yield

    scheduler.shutdown()


app = FastAPI(title="WatchFlip API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(collection.router, prefix="/api")
app.include_router(flips.router, prefix="/api")
app.include_router(alertes.router, prefix="/api")
app.include_router(veille.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}


# Serve React build — mount last so API routes take priority
DIST_DIR = os.path.join(os.path.dirname(__file__), "../frontend/dist")
if os.path.isdir(DIST_DIR):
    app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="static")
