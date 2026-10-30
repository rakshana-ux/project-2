import sqlite3
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "spotify_lab.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Table for saved recommendations
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_recommendations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seed_track_id TEXT NOT NULL,
        seed_track_name TEXT NOT NULL,
        seed_artist TEXT NOT NULL,
        recommended_track_id TEXT NOT NULL,
        recommended_track_name TEXT NOT NULL,
        recommended_artist TEXT NOT NULL,
        genre TEXT,
        similarity_score REAL NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Table for favorite songs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_favorites (
        track_id TEXT PRIMARY KEY,
        track_name TEXT NOT NULL,
        track_artist TEXT NOT NULL,
        playlist_genre TEXT,
        playlist_subgenre TEXT,
        track_popularity INTEGER,
        danceability REAL,
        energy REAL,
        tempo REAL,
        valence REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Table for user preferences
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_preferences (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    conn.commit()
    conn.close()

def save_favorite(song: Dict[str, Any]) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        INSERT OR REPLACE INTO user_favorites 
        (track_id, track_name, track_artist, playlist_genre, playlist_subgenre, track_popularity, danceability, energy, tempo, valence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            song.get("track_id"),
            song.get("track_name"),
            song.get("track_artist"),
            song.get("playlist_genre"),
            song.get("playlist_subgenre"),
            song.get("track_popularity", 0),
            song.get("danceability", 0.0),
            song.get("energy", 0.0),
            song.get("tempo", 0.0),
            song.get("valence", 0.0),
        ))
        conn.commit()
        return True
    finally:
        conn.close()

def remove_favorite(track_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM user_favorites WHERE track_id = ?", (track_id,))
        conn.commit()
        return True
    finally:
        conn.close()

def get_favorites() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM user_favorites ORDER BY created_at DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def save_recommendation_pair(
    seed_track_id: str,
    seed_track_name: str,
    seed_artist: str,
    rec_track_id: str,
    rec_track_name: str,
    rec_artist: str,
    genre: str,
    similarity_score: float,
    notes: Optional[str] = ""
) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        INSERT INTO saved_recommendations 
        (seed_track_id, seed_track_name, seed_artist, recommended_track_id, recommended_track_name, recommended_artist, genre, similarity_score, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (seed_track_id, seed_track_name, seed_artist, rec_track_id, rec_track_name, rec_artist, genre, similarity_score, notes))
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()

def get_saved_recommendations() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM saved_recommendations ORDER BY created_at DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def delete_saved_recommendation(rec_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM saved_recommendations WHERE id = ?", (rec_id,))
        conn.commit()
        return True
    finally:
        conn.close()
