import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import MovieEditModal from './MovieEditModal';
import '../styles/AdminMovieCard.css';

function AdminMovieCard({ movie, onClick, onMovieUpdate, onMovieDelete }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [movieData, setMovieData] = useState(movie);

    // Add useEffect to update movieData when movie prop changes
    useEffect(() => {
        setMovieData(movie);
    }, [movie]);
  
    const handleEditClick = (e) => {
        console.log('Edit clicked:', movie);
        console.log('Movie data:', movieData);
      e.stopPropagation();
      setIsModalOpen(true);
      setError(null);
      document.body.style.overflow = 'hidden';
    };
  
    const handleCloseModal = () => {
      setIsModalOpen(false);
      setError(null);
      document.body.style.overflow = 'unset';
    };
  
    const validateMovie = (movie) => {
        const required = [
            'title', 
            'description', 
            'thumbnail', 
            'videoUrl', 
            'rating', 
            'length',
            'director',
            'releaseDate',
            'language'
        ];
        const missing = required.filter(field => !movie[field]);
        
        if (missing.length > 0) {
            return `Missing required fields: ${missing.join(', ')}`;
        }
        return null;
      };
    
    const handleSave = async (updatedMovie) => {
      try {
        console.log('Starting save with data:', updatedMovie);
        setIsSaving(true);
        setError(null);

        const validationError = validateMovie(updatedMovie);
        if (validationError) {
            console.log('Validation failed:', validationError);
            setError(validationError);
            setIsSaving(false);
            return;
        }

        const response = await axios.put(
            `http://localhost:4000/api/movies/${movie._id}`, 
            updatedMovie, 
            { headers: { 'user-id': '6790aeff2af1fd8ab364f8f3' }}
        );

        console.log('API Response:', response.data);
        setMovieData(response.data); // Update local state
        
        if (onMovieUpdate) {
            console.log('Calling onMovieUpdate with:', response.data);
            onMovieUpdate(response.data); // Notify parent
        }
        
        handleCloseModal();
        window.location.reload(); // Refresh the main page
      } catch (error) {
        console.error('Save error:', error);
        const errorMessage = error.response?.status === 400 
            ? error.response?.data?.message || 'Invalid movie data'
            : 'Failed to update movie';
        setError(errorMessage);
      } finally {
        setIsSaving(false);
      }
    };

    const handleDelete = async (e) => {
        e.stopPropagation(); // Prevent card click
        
        if (window.confirm('Are you sure you want to delete this movie?')) {
            try {
                await axios.delete(
                    `http://localhost:4000/api/movies/${movie._id}`,
                    { headers: { 'user-id': '6790aeff2af1fd8ab364f8f3' }}
                );
                
                // Notify parent of deletion
                if (onMovieDelete) {
                    onMovieDelete(movie._id);
                }
            } catch (error) {
                console.error('Delete error:', error);
                setError('Failed to delete movie');
            }
        }
    };

  return (
    <>
      <div
        className="movie-card"
        onClick={onClick}
        style={{
          backgroundImage: `url(${movie.thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <p>{movie.title}</p>
        <button className="delete-movie-button" onClick={handleDelete}><FaTrash /></button>
        <button className="edit-movie-button" onClick={handleEditClick}><FaEdit /></button>
      </div>
      {isModalOpen && ReactDOM.createPortal(
        <MovieEditModal 
            movie={movieData}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
            isSaving={isSaving}
            error={error}
        />,
        document.body
        )}
    </>
  );
}

export default AdminMovieCard;