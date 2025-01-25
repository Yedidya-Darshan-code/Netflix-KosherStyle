import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa'; // Importing the search icon
import '../styles/NavBar.css';
//import user from '../../../NetflixProj3/models/user';

function Navbar( { onSearchResults, clearSearchResults, userInfo, loading} ) {
  
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [noResults, setNoResults] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const searchPanelRef = useRef(null);
    const dropdownRef = useRef(null);
    const [categories, setCategories] = useState([]);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const categoriesRef = useRef(null);
    const navigate = useNavigate();  


    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await axios.get('http://localhost:4000/api/categories', {
            headers: { 'user-id': userInfo.userId }
          });
          setCategories(response.data.categories || []);
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      };
      fetchCategories();
    }, []);
  
    // Add categories click handler
    const handleCategoryClick = async (categoryId) => {
      try {
        // First get the category details
        const categoryResponse = await axios.get(`http://localhost:4000/api/categories/${categoryId}`, {
          headers: { 'user-id': userInfo.userId }
        });

        // Get movie details for each movie ID
        const moviePromises = categoryResponse.data.movies.map(movieId => 
          axios.get(`http://localhost:4000/api/movies/${movieId}`, {
            headers: { 'user-id': userInfo.userId }
          })
        );

        const movieResponses = await Promise.all(moviePromises);
        const movies = movieResponses.map(response => response.data);

        onSearchResults(movies);
        setCategoriesOpen(false);
      } catch (error) {
        console.error('Error fetching category movies:', error);
      }
    };
  
    const handleSearchClick = () => {
      setSearchOpen(!searchOpen);
    };
  
    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
    };
  
    const handleSearchSubmit = async (e) => {
      e.preventDefault();
      console.log('Searching for:', searchQuery);
      try {
        const response = await axios.get(`http://localhost:4000/api/movies/search/${searchQuery}`, {
          headers: { 'user-id': userInfo.userId }
        });
        if (response.data.length === 0) {
            setNoResults(true);
            setTimeout(() => setNoResults(false), 3000); // Hide the message after 3 seconds
        } else {
            setNoResults(false);
        }
        onSearchResults(response.data);
        setSearchOpen(false);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    const handleClickOutside = (event) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setCategoriesOpen(false);
      }
      };
    
      useEffect(() => {
      if (searchOpen || dropdownOpen || categoriesOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      } else {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
      }, [searchOpen, dropdownOpen, categoriesOpen]);

    const handleProfileClick = () => {
      setDropdownOpen(!dropdownOpen);
      };   

      const handleLogoClick = () => {
        // כאן אנחנו שולחים את הטוקן יחד עם הנווט
        navigate('/homescreen', { state: { token: userInfo?.token } });
      };

      return (
        <>
          {/* Check if loading is complete before rendering */}
          {!loading && (
            <div className="navbar">
              {/* Logo */}
              <div className="logo" onClick={handleLogoClick}>
              Notflicks
            </div>
      
              {/* Navbar Links */}
              <div className="nav-links" onClick={clearSearchResults}>
                <div className="categories-dropdown" ref={categoriesRef}>
                  <button 
                    className="categories-button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      setCategoriesOpen(!categoriesOpen);
                    }}
                  >
                    Categories ▼
                  </button>
                  {categoriesOpen && (
                    <div className="categories-menu">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event bubbling
                          navigate('/categories', { state: { token: userInfo?.token } }); 
                        }}
                        className="category-item all-categories"
                      >
                        All
                      </button>
      
                      {categories.map(category => (
                        <button 
                          key={category._id}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            handleCategoryClick(category._id);
                          }}
                          className="category-item"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Link to="/">Home</Link>
                <Link to="/movies">Movies</Link>
                <Link to="/tv-shows">TV Shows</Link>
                <Link to="/my-list">My List</Link>
              </div>
      
              {/* Profile and Search Icons */}
              <div className="profile-and-search">
                {/* Search Icon */}
                <FaSearch className="search-icon" onClick={handleSearchClick} />
                {/* Search Panel */}
                {searchOpen && (
                  <div className="search-panel" ref={searchPanelRef}>
                    <form onSubmit={handleSearchSubmit}>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search for movies, TV shows..."
                      />
                      <button type="submit">Search</button>
                    </form>
                    {noResults && <div className="no-results-toast">No results found</div>}
                  </div>
                )}
                {/* Profile Icon */}
                <div className="profile-icon" onClick={handleProfileClick}>
                  {loading ? (
                    <div>Loading...</div>
                  ) : (
                    <div className="profile-details">
                      <span className="username">Hello, {userInfo?.name}</span>
                      <img src={userInfo?.avatar} alt="Profile" />
                    </div>
                  )}
                </div>
      
                {dropdownOpen && (
                  <div className="dropdown-menu" ref={dropdownRef}>
                    <Link to="/profile">Profile</Link>
                    <Link to="/settings">Settings</Link>
                    <Link to="/">Logout</Link>
                    {userInfo?.isAdmin && (
                      <Link 
                        to="/admin" 
                        state={{ token: userInfo?.token }}
                      >
                        Admin
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      );
      
}

export default Navbar;
