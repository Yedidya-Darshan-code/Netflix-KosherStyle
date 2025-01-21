import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import RandomMovie from '../components/RandomMovie';
import CategoryRow from '../components/CategoryRow';
import Navbar from '../components/NavBar';  // Importing the Navbar component
import AdminCategoryRow from '../components/AdminCategoryRow';  // Importing the AdminCategoryRow component
import MoviePopup from '../components/MoviePopup';  // assuming you already have the modal component
import SearchResults from '../components/SearchResults';  // assuming you already have the search results component
import '../styles/HomeScreen.css';

function HomeScreen( {isAdmin} ) {
  const [movies, setMovies] = useState([]);
  const [randomMovie, setRandomMovie] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Fetch movies data from API and details for each movie
  useEffect(() => {
    async function fetchMovies() {
      try {
        //get user-id from the tokes first
        const response = await axios.get('http://localhost:4000/api/movies', {
          headers: { 'user-id': '678f5239892efc5766c18798' }
        });

        // Fetch the details of each movie in each category
        const fetchedMoviesByCategory = [];
        for (const category of response.data.promotedCategories) {
          const fetchedMovies = [];
          for (const movieId of category.movies) {
            try {
              const movieResponse = await axios.get(`http://localhost:4000/api/movies/${movieId}`, {
                headers: { 'user-id': '678f5239892efc5766c18798' }
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
          isAdmin ? (
            <AdminCategoryRow key={index} categoryName={category.category} movies={category.movies} onMovieClick={handleMovieClick} />
          ) : (
            <CategoryRow key={index} categoryName={category.category} movies={category.movies} onMovieClick={handleMovieClick} />
          )
            ))}
          </div>
        ) : (
          <SearchResults searchResults={searchResults} handleMovieClick={handleMovieClick} isAdmin={isAdmin} />
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
