import React from 'react';
import { FaGooglePlay, FaApple, FaGoogleDrive } from 'react-icons/fa';
import { TiHome } from 'react-icons/ti';
import './DownloadPage.css'; // Assuming you have a CSS file for styling
import { NavLink } from 'react-router-dom';

const DownloadPage = () => {
  return (
    <div className="download-page">
      <div className="download-container">
        <h1>Download the Weather App</h1>
        <p>Stay updated with real-time weather forecasts and alerts. Download our app today!</p>
        <img 
          src="https://cdn-icons-png.flaticon.com/512/4814/4814268.png" 
          alt="App Illustration" 
          className="app-image"
        />
        <div className="button-group">
          <a
            href="https://play.google.com/store/apps" 
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-google"
          >
            <FaGoogleDrive className="icon" /> Google Drive
          </a>
          <NavLink
            to="/" 
            rel="noopener noreferrer"
            className="btn btn-apple"
          >
            <TiHome className="icon" /> Home
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
