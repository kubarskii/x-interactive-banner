from twikit import Client
import asyncio
import json
import os
from dotenv import load_dotenv
import sys

load_dotenv()

async def get_followers():
    try:
        client = Client('en-US')
        
        # Login using environment variables
        await client.login(
            auth_info_1=os.getenv('TWITTER_USERNAME'),
            auth_info_2=os.getenv('TWITTER_EMAIL'),
            password=os.getenv('TWITTER_PASSWORD')
        )

        # First get the numeric ID for the target user
        target_username = os.getenv('TARGET_USERNAME')
        user_info = await client.get_user_by_screen_name(target_username)
        user_id = user_info.id

        # Now get followers using the numeric ID
        followers = await client.get_user_followers(user_id)
        
        # Debug print to see the structure
        print(f"Debug - First follower data: {vars(followers[0]) if followers else 'No followers'}", file=sys.stderr)

        # Convert followers to dictionary format with correct attributes
        followers_data = [
            {
                'id': follower.id,
                'name': follower.name,  # Changed from username
                'profile_image_url': follower.profile_image_url.replace('_normal', '') if hasattr(follower, 'profile_image_url') else None
            }
            for follower in followers[:15] if hasattr(follower, 'id')  # Limit to 15 followers
        ]

        # Print as JSON so Node.js can parse it
        print(json.dumps(followers_data))

    except Exception as e:
        import traceback
        error_details = {
            'error': str(e),
            'traceback': traceback.format_exc()
        }
        print(json.dumps(error_details))

async def update_profile_image(image_path):
    try:
        client = Client('en-US')
        
        # Login using environment variables
        await client.login(
            auth_info_1=os.getenv('TWITTER_USERNAME'),
            auth_info_2=os.getenv('TWITTER_EMAIL'),
            password=os.getenv('TWITTER_PASSWORD')
        )

        # Read the image file as bytes
        with open(image_path, 'rb') as image_file:
            image_data = image_file.read()

        # Update profile image using the correct method
        client
        await client.api.account.update_profile_image(image_data)
        
        print(json.dumps({"success": True, "message": "Profile image updated successfully"}))

    except Exception as e:
        import traceback
        error_details = {
            'error': str(e),
            'traceback': traceback.format_exc()
        }
        print(json.dumps(error_details))

async def update_banner(banner_path):
    try:
        client = Client('en-US')
        
        # Login using environment variables
        await client.login(
            auth_info_1=os.getenv('TWITTER_USERNAME'),
            auth_info_2=os.getenv('TWITTER_EMAIL'),
            password=os.getenv('TWITTER_PASSWORD')
        )

        # Read the banner image and prepare multipart form data
        with open(banner_path, 'rb') as banner_file:
            files = {
                'banner': ('banner.jpg', banner_file, 'image/jpeg')
            }
            
            # Remove content-type from headers as it will be set automatically for multipart
            headers = client._base_headers.copy()
            headers.pop('content-type', None)
            
            # Make the request
            _, response = await client.post(
                'https://api.twitter.com/1.1/account/update_profile_banner.json',
                files=files,
                headers=headers
            )
        
        print(json.dumps({"success": True, "message": "Banner updated successfully"}))

    except Exception as e:
        import traceback
        error_details = {
            'error': str(e),
            'traceback': traceback.format_exc()
        }
        print(json.dumps(error_details))

# Modify the main block to handle all functions
if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == 'update_image':
            if len(sys.argv) > 2:
                asyncio.run(update_profile_image(sys.argv[2]))
            else:
                print(json.dumps({"error": "Image path not provided"}))
        elif sys.argv[1] == 'update_banner':
            if len(sys.argv) > 2:
                asyncio.run(update_banner(sys.argv[2]))
            else:
                print(json.dumps({"error": "Banner path not provided"}))
    else:
        asyncio.run(get_followers()) 