#!/bin/bash

###############################################################################
# Clean Reports
# Removes all generated test reports
###############################################################################

echo "Cleaning test reports..."

if [ -d "reports" ]; then
  rm -rf reports/*
  echo "✅ Reports directory cleaned"
else
  echo "⚠️  No reports directory found"
fi

echo "Done!"

