import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { Link } from 'react-router-dom';
import RandomMovie from '../components/RandomMovie';
import CategoryRow from '../components/CategoryRow';
import Navbar from '../components/NavBar';  // Importing the Navbar component
import MovieCard from '../components/MovieCard';
import MoviePopup from '../components/MoviePopup';  // assuming you already have the modal component
import SearchResults from '../components/SearchResults';  // assuming you already have the search results component
import '../styles/HomeScreen.css';
import { useLocation } from 'react-router-dom';


function HomeScreen() {
  const [movies, setMovies] = useState([]);
  const [randomMovie, setRandomMovie] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = location.state?.token;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkToken() {
      try {
        if (!token) throw new Error('Token not found');
        const response = await axios.get('http://localhost:4000/api/tokens', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          console.log('User is logged in');
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        navigate('/'); 
      } finally {
        setLoading(false); 
      }
    }

    checkToken();
  }, [navigate]);


  // Fetch movies data from API and details for each movie
  useEffect(() => {
    async function fetchMovies() {
      try {
        //get user-id from the tokes first
        const response = await axios.get('http://localhost:4000/api/movies', {
          headers: { 'user-id': '6788f8771a6c2941d023825c' }
        });

        // Fetch the details of each movie in each category
        const fetchedMoviesByCategory = [];
        for (const category of response.data.promotedCategories) {
          const fetchedMovies = [];
          for (const movieId of category.movies) {
            try {
              const movieResponse = await axios.get(`http://localhost:4000/api/movies/${movieId}`, {
                headers: { 'user-id': '6788f8771a6c2941d023825c' }
              });
              fetchedMovies.push(movieResponse.data);
            } catch (error) {
              console.error(`Error fetching movie details for movieId ${movieId}:`, error);
            }
          }
          fetchedMoviesByCategory.push({ category: category.category, movies: fetchedMovies });
        }

        setMovies(fetchedMoviesByCategory); // Set all the fetched movies by categories

        // Get a random movie from the response (for the random movie section)
        if (fetchedMoviesByCategory.length > 0) {
          const randomCategory = fetchedMoviesByCategory[Math.floor(Math.random() * fetchedMoviesByCategory.length)];
          const random = randomCategory.movies[Math.floor(Math.random() * randomCategory.movies.length)];
          setRandomMovie(random);
        }
      } catch (error) {
        console.error("Error fetching categories or movie details:", error);
      }
    }

    fetchMovies();
  }, []);

  // Handle search results
  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  // Clear search results
  const clearSearchResults = () => {
    setSearchResults([]);
  };

  // Handle click on a movie card to open the modal
  const handleMovieClick = (movieId) => {
    const movie = searchResults.length > 0
      ? searchResults.find(m => m._id === movieId)
      : movies.flatMap(category => category.movies).find(m => m._id === movieId);
    setSelectedMovie(movie);
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading spinner or message
  }

  return (
    <div className="homeScreenBody">
      <Navbar onSearchResults={handleSearchResults} clearSearchResults={clearSearchResults} /> {/* Navbar component */}
      {/* Random Movie Section */}
      {randomMovie && searchResults.length === 0 && (
        <RandomMovie movie={randomMovie} onClick={() => setSelectedMovie(randomMovie)} />
      )}

      {/* Movie Categories Section */}
      {searchResults.length === 0 ? (
        <div className="movieCategories">
          {movies.length > 0 && movies.map((category, index) => (
            <CategoryRow key={index} categoryName={category.category} movies={category.movies} onMovieClick={handleMovieClick} />
          ))}
        </div>
      ) : (
        <SearchResults searchResults={searchResults} handleMovieClick={handleMovieClick} />
      )}

      {/* Movie Popup */}
      {selectedMovie && (
        <MoviePopup initialMovie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
      <Link to="/another">Go to Another Page</Link>
    </div>
  );
}

export default HomeScreen;
