import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard'; // Import your existing MovieCard component
import '../styles/MoviePopup.css';

function MoviePopup({ initialMovie, onClose }) {
  const [movie, setMovie] = useState(initialMovie);
  const [recommendations, setRecommendations] = useState([]);
  const [show, setShow] = useState(false);

  // Fetch recommendations when the modal opens
  useEffect(() => {
    async function fetchRecommendations() {
      if (!movie?._id) return;

      try {
        console.log('Fetching recommendations for movie:', movie.title, movie._id);
        const response = await axios.get(`http://localhost:4000/api/movies/${movie._id}/recommend`, {
          headers: { 'user-id': '67896618dc8bdabbd1a66ba7' }
        });
        const recommendedMovieIds = response.data; // Assuming the response is a list of movie IDs

        // Fetch details for each recommended movie
        const recommendedMovies = await Promise.all(
          recommendedMovieIds.map(async (id) => {
            try {
              const movieResponse = await axios.get(`http://localhost:4000/api/movies/${id}`, {
                headers: { 'user-id': '67896618dc8bdabbd1a66ba7' }
              });
              return movieResponse.data;
            } catch (error) {
              console.error(`Error fetching recommended movie ${id}:`, error);
              return null;
            }
          })
        );

        setRecommendations(recommendedMovies.filter((rec) => rec !== null)); // Filter out null responses
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    }

    fetchRecommendations();
  }, [movie]);

  useEffect(() => {
    // Add class to body to disable scrolling
    document.body.classList.add('no-scroll');
    setShow(true);

    // Cleanup function to remove class when modal is closed
    return () => {
      document.body.classList.remove('no-scroll');
      setShow(false);
    };
  }, []);

  if (!movie) return null;

  return (
    <div className="movie-popup-overlay" onClick={onClose}>
      <div className="movie-popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>X</button>
        <h2>{movie.title}</h2>
        <p><strong>Length:</strong> {movie.length} mins</p>
        <p><strong>Director:</strong> {movie.director}</p>
        <p><strong>Language:</strong> {movie.language}</p>
        <p><strong>Release Date:</strong> {new Date(movie.releaseDate).toDateString()}</p>
        <p><strong>Subtitles:</strong> {movie.subtitles.join(', ')}</p>
        <button className="watch-button">Watch Movie</button>
        <div className="movie-popup-recommendations">
          <h3>Recommendations</h3>
          <div className="recommendations-container">
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <MovieCard key={rec._id} movie={rec} onClick={() => setMovie(rec)} />
              ))
            ) : (
              <p>No recommendations available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoviePopup;
