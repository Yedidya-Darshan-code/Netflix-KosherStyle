package com.example.netflix_app4.view;

import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.GridLayout;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.netflix_app4.R;
import com.example.netflix_app4.model.MovieModel;
import com.example.netflix_app4.network.MovieApiService;
import com.example.netflix_app4.network.RetrofitClient;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MovieDetailsActivity extends AppCompatActivity {

    private ImageView moviePreview;
    private TextView movieTitle, movieDescription;
    private GridLayout movieInfoGrid;
    private ImageButton backButton;
    private Button watchButton;
    private RecyclerView recommendationRecyclerView;
    private RecommendationAdapter recommendationAdapter;
    private TextView recommendationTitle;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.movie_details);

        // Initialize UI elements
        moviePreview = findViewById(R.id.moviePreview);
        movieTitle = findViewById(R.id.movieTitle);
        movieDescription = findViewById(R.id.movieDescription);
        movieInfoGrid = findViewById(R.id.movieInfoGrid);
        watchButton = findViewById(R.id.watchButton);
        backButton = findViewById(R.id.backButton);
        recommendationRecyclerView = findViewById(R.id.recommendationRecyclerView);

        // Retrieve the movie details from Intent
        MovieModel movie = getIntent().getParcelableExtra("movieDetails");
        if (movie != null) {
            setupMovieDetails(movie);
            fetchRecommendations(movie.getId());
        }

        // Back button action
        backButton.setOnClickListener(v -> finish());
        recommendationTitle = findViewById(R.id.recommendationTitle);
        recommendationTitle.setVisibility(View.GONE); // Initially hidden
    }

    private void setupMovieDetails(MovieModel movie) {
        movieTitle.setText(movie.getTitle());
        movieDescription.setText(movie.getDescription());
        Glide.with(this).load(movie.getThumbnail()).into(moviePreview);

        addInfoToGrid("Length", movie.getLength() + " minutes");
        addInfoToGrid("Director", movie.getDirector());
        addInfoToGrid("Language", movie.getLanguage());
        addInfoToGrid("Release Date", movie.getReleaseDate());
    }

    private void fetchRecommendations(String movieId) {
        recommendationAdapter = new RecommendationAdapter(this);
        recommendationRecyclerView.setLayoutManager(new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        recommendationRecyclerView.setAdapter(recommendationAdapter);

        // Make a GET request
        MovieApiService apiService = RetrofitClient.getRetrofitInstance().create(MovieApiService.class);
        Call<List<String>> call = apiService.getRecommendations(movieId, "679615afd6aeeebe1038f023");

        call.enqueue(new Callback<List<String>>() {
            @Override
            public void onResponse(Call<List<String>> call, Response<List<String>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<String> recommendedIds = response.body();
                    Log.d("Recommendations", "Fetched: " + recommendedIds);
                    recommendationTitle.setVisibility(View.VISIBLE); // Show the title
                    fetchRecommendedMovies(recommendedIds);
                } else {
                    recommendationTitle.setVisibility(View.GONE); // Hide the title if no recommendations
                }
            }

            @Override
            public void onFailure(Call<List<String>> call, Throwable t) {
                recommendationTitle.setVisibility(View.GONE); // Hide the title on failure
                Log.e("Recommendations", "Failed to fetch recommendations: " + t.getMessage());
            }
        });
    }


    private void fetchRecommendedMovies(List<String> movieIds) {
        MovieApiService apiService = RetrofitClient.getRetrofitInstance().create(MovieApiService.class);
        for (String movieId : movieIds) {
            apiService.getMovieById(movieId, "679615afd6aeeebe1038f023").enqueue(new Callback<MovieModel>() {
                @Override
                public void onResponse(Call<MovieModel> call, Response<MovieModel> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        recommendationAdapter.addMovie(response.body());
                    }
                }

                @Override
                public void onFailure(Call<MovieModel> call, Throwable t) {
                    Log.e("Recommendations", "Failed to fetch movie details: " + t.getMessage());
                }
            });
        }
    }

    private void addInfoToGrid(String label, String value) {
        if (value == null || value.trim().isEmpty()) {
            Log.d("addInfoToGrid", "Skipped adding: " + label + " because value is empty or null.");
            return; // Skip empty or null values
        }
        Log.d("addInfoToGrid", "Adding to grid - " + label + ": " + value);

        // Create a new LinearLayout for the info card
        LinearLayout infoCard = new LinearLayout(this);
        infoCard.setOrientation(LinearLayout.VERTICAL);
        infoCard.setBackgroundResource(R.drawable.card_background);
        infoCard.setPadding(16, 16, 16, 16);

        // Label TextView
        TextView labelView = new TextView(this);
        labelView.setText(label.toUpperCase());
        labelView.setTextColor(Color.GRAY);
        labelView.setTextSize(12);
        labelView.setTypeface(null, Typeface.BOLD);
        labelView.setGravity(Gravity.CENTER);

        // Value TextView
        TextView valueView = new TextView(this);
        valueView.setText(value);
        valueView.setTextColor(Color.WHITE);
        valueView.setTextSize(16);
        valueView.setGravity(Gravity.CENTER);

        // Add label and value to the info card
        infoCard.addView(labelView);
        infoCard.addView(valueView);

        // Set GridLayout parameters for the card
        GridLayout.LayoutParams params = new GridLayout.LayoutParams();
        params.setMargins(16, 16, 16, 16);
        params.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f); // Take up one column
        params.rowSpec = GridLayout.spec(GridLayout.UNDEFINED); // Automatically move to the next row if needed
        infoCard.setLayoutParams(params);

        // Add the card to the GridLayout
        movieInfoGrid.addView(infoCard);
    }


}


