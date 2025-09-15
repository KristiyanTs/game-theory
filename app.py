"""
Hugging Face Spaces entry point for Prisoner's Dilemma Benchmark
This file is required by Hugging Face Spaces but the actual app runs via Docker
"""

import subprocess
import os
import sys

def main():
    """
    Entry point for Hugging Face Spaces.
    This starts the Next.js application via Docker.
    """
    print("Starting Prisoner's Dilemma Benchmark...")
    
    # The actual application will be served by the Next.js server
    # running in the Docker container on port 7860
    print("Application is running on port 7860")
    print("Visit the Space URL to access the application")

if __name__ == "__main__":
    main()
