# Twitter Follower Thank You Banner

This project automatically creates and updates a Twitter banner to thank your latest followers by displaying their profile pictures in a customized banner image.

## Features

- Fetches your latest Twitter followers
- Downloads follower profile pictures
- Creates a customized banner with circular profile pictures
- Automatically updates your Twitter profile banner
- Handles cleanup of temporary files

## Prerequisites

### Node.js Dependencies 

```bash
npm install
```

### Python Dependencies

```bash
pip install -r requirements.txt
```

## Setup

1. Create a `.env` file in the root directory with the following variables:
```env
TWITTER_USERNAME=your_username
TWITTER_EMAIL=your_email
TWITTER_PASSWORD=your_password
TARGET_USERNAME=target_twitter_handle
```

2. Place your background image as `bg.png` in the root directory
   - Recommended dimensions: 1500x500 pixels
   - Format: PNG

## File Structure
```
├── index.js              # Main Node.js application
├── get_followers.py      # Python script for Twitter API interactions
├── banner_extension.py   # Twitter API extension for banner updates
├── requirements.txt      # Python dependencies
├── bg.png               # Background image template
└── .env                 # Environment variables
```

## Usage

Run the application with:
```bash
node index.js
```

The script will:
1. Fetch your latest followers
2. Download their profile pictures
3. Create a composite image with circular profile pictures
4. Update your Twitter banner
5. Clean up temporary files

## Error Handling

The application includes comprehensive error handling and logging:
- File system operations
- Image processing
- API interactions
- Network requests

## Contributing

Feel free to submit issues and pull requests.

## License

[MIT License](LICENSE)