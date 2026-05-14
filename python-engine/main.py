import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import uuid
import numpy as np
import cv2
import time
from typing import List

app = FastAPI()

# Temporary local storage for mocks
TMP_DIR = "/tmp/mosaic_uploads"
os.makedirs(TMP_DIR, exist_ok=True)

from fastapi.responses import FileResponse

@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(TMP_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='application/zip', filename=filename)
    return JSONResponse(status_code=404, content={"error": "File not found"})

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    """Mock Cloud Storage Upload - saves to /tmp and returns a mock ID/URL"""
    try:
        # Generate a unique ID
        mock_id = f"img_{uuid.uuid4().hex[:12]}"

        # Save file to /tmp to mock cloud storage
        file_path = os.path.join(TMP_DIR, f"{mock_id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"[Python Engine/Upload] Saved file {file.filename} as {mock_id}")

        return {
            "success": True,
            "id": mock_id,
            "message": "Upload successful (mocked cloud storage)"
        }
    except Exception as e:
        print(f"Upload error: {e}")
        return JSONResponse(status_code=500, content={"error": "Internal Server Error"})

@app.post("/api/style")
async def process_style(
    vibe: str = Form(...),
    recipient: str = Form(...),
    occasion: str = Form(...),
    mainImageId: str = Form(...),
    tileImageIds: str = Form(...) # expecting a comma separated string
):
    """
    1. Simulates calling Replicate (Stable Diffusion) to style the main image based on vibe
    2. Simulates running OpenCV to calculate the smart grid mapping for tiles
    """
    try:
        print(f"[Python Engine/Style] Received Request - Vibe: {vibe}, Main ID: {mainImageId}")
        tile_ids = tileImageIds.split(",") if tileImageIds else []
        print(f"[Python Engine/Style] Received {len(tile_ids)} tile IDs")

        # ---------------------------------------------------------
        # Step 1: MOCK STABLE DIFFUSION API CALL (Replicate)
        # ---------------------------------------------------------
        print("[Python Engine/Style] Triggering Replicate API (Mock)...")
        time.sleep(1.5) # Simulate API latency
        styled_image_url = "https://example.com/mock-styled-result.jpg"

        # ---------------------------------------------------------
        # Step 2: SMART GRID ALGORITHM (OpenCV Mock)
        # ---------------------------------------------------------
        print("[Python Engine/Style] Running OpenCV Smart Grid Algorithm...")
        time.sleep(1) # Simulate CPU intense OpenCV processing

        # In a real scenario, we would load the main image and tiles using cv2.imread(),
        # resize them, extract color histograms/edge features, and find best matches.

        # We will mock the output mapping here
        grid_mapping = []
        for index, t_id in enumerate(tile_ids):
            grid_mapping.append({
                "tile_id": t_id,
                "grid_position": {
                    "x": index % 5, # Mock 5 columns
                    "y": index // 5
                },
                "match_score": round(np.random.uniform(0.75, 0.99), 2)
            })

        # ---------------------------------------------------------
        # Step 3: GENERATE SOLUTION GRID (Bild 31) & ZIP ARCHIVE
        # ---------------------------------------------------------
        print("[Python Engine/Style] Generating Solution Grid & Packing ZIP Archive...")
        import zipfile

        job_id = f"job_{uuid.uuid4().hex[:12]}"
        zip_filename = f"{job_id}_mosaic_kit.zip"
        zip_path = os.path.join(TMP_DIR, zip_filename)

        # Create a dummy solution grid image using OpenCV
        solution_img = np.zeros((800, 800, 3), dtype=np.uint8)
        solution_img[:] = (200, 200, 200) # light gray background
        cv2.putText(solution_img, "Mosaic Solution Grid", (50, 400), cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 0), 3)
        solution_img_path = os.path.join(TMP_DIR, f"{job_id}_solution.jpg")
        cv2.imwrite(solution_img_path, solution_img)

        # Pack into ZIP
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            zipf.write(solution_img_path, arcname="solution_grid.jpg")
            # In a real app, we would also add the styled main image and all tiles here

        zip_url = f"http://localhost:8000/download/{zip_filename}"

        print("[Python Engine/Style] Processing Complete!")

        return {
            "success": True,
            "message": "Mosaic generation completed successfully.",
            "jobId": job_id,
            "resultUrl": styled_image_url,
            "gridMapping": grid_mapping,
            "zipUrl": zip_url
        }

    except Exception as e:
        print(f"Style processing error: {e}")
        return JSONResponse(status_code=500, content={"error": "Internal Server Error"})

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
