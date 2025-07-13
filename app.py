# app.py

import streamlit as st
import pandas as pd
import ast

# --- Page Configuration (MUST be the first Streamlit command) ---
st.set_page_config(
    page_title="Kolkata Bus Route Finder",
    page_icon="🚌",
    layout="centered",
    initial_sidebar_state="auto"
)

# --- Caching the Data Loading ---
# @st.cache_data is a magic Streamlit decorator that prevents the app
# from reloading the data from disk every time a user interacts with it.
@st.cache_data
def load_data():
    """Loads and prepares the bus route data."""
    try:
        df = pd.read_csv('standardized_bus_routes.csv')
        df['stoppages'] = df['stoppages'].apply(ast.literal_eval)
        # Create a sorted, unique list of all stops for dropdown menus
        all_stops = sorted(list(set(stop for sublist in df['stoppages'] for stop in sublist)))
        return df, all_stops
    except FileNotFoundError:
        return None, None

# --- Load the data when the app starts ---
df, all_stops = load_data()

# --- Search Functions ("The Model") ---
# These are the same functions from your command-line app
def find_by_route_no(route_name):
    result = df[df['route_no'].str.lower() == route_name.lower()]
    return result

def find_by_start_point(start_point):
    result = df[df['originating_point'] == start_point]
    return result

def find_by_stoppage(stop_name):
    mask = df['stoppages'].apply(lambda stops_list: stop_name in stops_list)
    result = df[mask]
    return result

def find_common_routes(stop1, stop2):
    mask = df['stoppages'].apply(lambda stops: stop1 in stops and stop2 in stops)
    result = df[mask]
    return result

# --- UI Display Function ---
def display_results(results_df):
    """Displays the search results in a user-friendly format in the web app."""
    if results_df.empty:
        st.warning("No buses found matching your search.")
        return
    
    st.success(f"Found {len(results_df)} bus route(s):")
    
    # Use st.expander to make the UI cleaner
    for index, row in results_df.iterrows():
        with st.expander(f"🚌 **Route {row['route_no']}**: {row['originating_point']} to {row['terminating_point']}"):
            st.write("**Full Route:**")
            # Create a more readable list of stops
            stoppages_str = ' -> '.join(row['stoppages'])
            st.info(stoppages_str)


# --- Main Application UI ---
st.title("🚌 Kolkata Bus Route Finder")
st.markdown("Find your way through the City of Joy! Select a search option from the sidebar.")

# Check if data was loaded successfully
if df is None or all_stops is None:
    st.error("Fatal Error: `standardized_bus_routes.csv` not found. Please make sure the data file is in the same directory as the app and restart.")
else:
    # --- Sidebar for Search Options ---
    st.sidebar.header("Search Options")
    search_option = st.sidebar.radio(
        "Choose how you want to search:",
        ("Find buses through a specific Stoppage",
         "Find common buses between two Stoppages",
         "Find buses from a Starting Point",
         "Find a bus by Route Number")
    )

    # --- Conditional UI based on user's choice ---
    if search_option == "Find a bus by Route Number":
        st.subheader("Search by Route Number")
        route_list = sorted(df['route_no'].unique())
        selected_route = st.selectbox("Select a Route Number:", options=route_list)
        if st.button("Search by Route"):
            results = find_by_route_no(selected_route)
            display_results(results)

    elif search_option == "Find buses from a Starting Point":
        st.subheader("Search by Starting Point")
        start_points = sorted(df['originating_point'].unique())
        selected_start = st.selectbox("Select a Starting Point:", options=start_points)
        if st.button("Search by Start Point"):
            results = find_by_start_point(selected_start)
            display_results(results)

    elif search_option == "Find buses through a specific Stoppage":
        st.subheader("Search by Stoppage")
        selected_stop = st.selectbox("Select a Stoppage:", options=all_stops)
        if st.button("Search by Stoppage"):
            results = find_by_stoppage(selected_stop)
            display_results(results)

    elif search_option == "Find common buses between two Stoppages":
        st.subheader("Find Common Routes Between Two Stoppages")
        col1, col2 = st.columns(2) # Create two columns for a better layout
        with col1:
            stop1 = st.selectbox("Select the First Stoppage:", options=all_stops, key="stop1")
        with col2:
            stop2 = st.selectbox("Select the Second Stoppage:", options=all_stops, key="stop2")
        
        if st.button("Find Common Routes"):
            if stop1 == stop2:
                st.warning("Please select two different stoppages.")
            else:
                results = find_common_routes(stop1, stop2)
                display_results(results)

# --- Footer ---
st.markdown("---")
st.markdown("Kolkata Bus Route")