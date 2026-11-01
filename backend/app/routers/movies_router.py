from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import User, MovieRecommendation
from app.auth import get_current_user

router = APIRouter(prefix="/api/movies", tags=["Movie Recommendation System"])

INITIAL_MOVIES = [
    {
        "title": "The Pursuit of Happyness",
        "category": "Interview Motivation",
        "imdb_rating": 8.0,
        "genre": "Biography, Drama",
        "runtime": "1h 57m",
        "poster_url": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
        "trailer_url": "https://www.youtube.com/watch?v=DMOBlEcRuw8",
        "streaming_availability": "Netflix, Amazon Prime",
        "recommendation_reason": "Masterclass in resilience, unyielding work ethic, and pushing through tough interview challenges to achieve career breakthrough."
    },
    {
        "title": "The Social Network",
        "category": "Startup",
        "imdb_rating": 7.8,
        "genre": "Biography, Drama",
        "runtime": "2h 0m",
        "poster_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
        "trailer_url": "https://www.youtube.com/watch?v=lB95KLp762o",
        "streaming_availability": "Hulu, Apple TV",
        "recommendation_reason": "Shows rapid product scaling, intense algorithmic coding sessions, and startup engineering execution."
    },
    {
        "title": "Moneyball",
        "category": "Technology",
        "imdb_rating": 7.6,
        "genre": "Biography, Drama, Sport",
        "runtime": "2h 13m",
        "poster_url": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
        "trailer_url": "https://www.youtube.com/watch?v=-4QPVo0UIzc",
        "streaming_availability": "Netflix",
        "recommendation_reason": "Highlights the power of data analytics, statistical modeling, and challenging conventional wisdom with evidence."
    },
    {
        "title": "The Imitation Game",
        "category": "Technology",
        "imdb_rating": 8.0,
        "genre": "Biography, Drama, Thriller",
        "runtime": "1h 54m",
        "poster_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
        "trailer_url": "https://www.youtube.com/watch?v=nuPZUUED5uk",
        "streaming_availability": "Amazon Prime",
        "recommendation_reason": "Chronicles Alan Turing's invention of modern computer science and perseverance against complex problem constraints."
    },
    {
        "title": "Steve Jobs",
        "category": "Leadership",
        "imdb_rating": 7.2,
        "genre": "Biography, Drama",
        "runtime": "2h 2m",
        "poster_url": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
        "trailer_url": "https://www.youtube.com/watch?v=aEr6K1bwIVs",
        "streaming_availability": "Apple TV",
        "recommendation_reason": "Invaluable insights into product design excellence, uncompromising quality standards, and vision execution."
    },
    {
        "title": "Hidden Figures",
        "category": "Self Growth",
        "imdb_rating": 7.8,
        "genre": "Biography, Drama, History",
        "runtime": "2h 7m",
        "poster_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        "trailer_url": "https://www.youtube.com/watch?v=5wfrDhgUMGI",
        "streaming_availability": "Disney+",
        "recommendation_reason": "Inspiring demonstration of mathematical rigor, technical leadership, and breaking barriers in STEM careers."
    },
    {
        "title": "The Founder",
        "category": "Business",
        "imdb_rating": 7.2,
        "genre": "Biography, Drama",
        "runtime": "1h 55m",
        "poster_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
        "trailer_url": "https://www.youtube.com/watch?v=AX2uz2nSZ5E",
        "streaming_availability": "Netflix",
        "recommendation_reason": "Teaches process optimization, franchise scalability, and persistence in business expansion."
    },
    {
        "title": "The Intern",
        "category": "Interview Motivation",
        "imdb_rating": 7.1,
        "genre": "Comedy, Drama",
        "runtime": "2h 1m",
        "poster_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
        "trailer_url": "https://www.youtube.com/watch?v=ZU3Xban0Y6A",
        "streaming_availability": "Amazon Prime",
        "recommendation_reason": "Highlights continuous learning, adaptability across generations, and timeless work ethic."
    }
]

def seed_movies_if_empty(db: Session):
    count = db.query(MovieRecommendation).count()
    if count == 0:
        for m in INITIAL_MOVIES:
            db_m = MovieRecommendation(**m)
            db.add(db_m)
        db.commit()

@router.get("/recommendations")
def get_movie_recommendations(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seed_movies_if_empty(db)
    query = db.query(MovieRecommendation)
    if category and category != "All":
        query = query.filter(MovieRecommendation.category == category)
    return query.all()
