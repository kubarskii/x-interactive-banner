require('dotenv').config();
const { exec } = require('child_process');
const sharp = require('sharp');
const fs = require('fs').promises;
const axios = require('axios');
const Twitter = require('twitter-api-v2').TwitterApi;

async function downloadImage(url, outputPath) {
    try {
        console.log(`Downloading image from ${url}`);
        const response = await axios({
            url,
            responseType: 'arraybuffer'
        });

        console.log(`Processing image for ${outputPath}`);
        await sharp(response.data)
            .resize(150, 150, {
                fit: 'cover',
                position: 'center'
            })
            .toFile(outputPath);

        // Verify file exists
        await fs.access(outputPath);
        console.log(`Successfully downloaded and verified image: ${outputPath}`);
        return true;
    } catch (error) {
        console.error(`Error processing image from ${url}:`, error.message);
        return false;
    }
}

async function createThankYouImage(imagePaths) {
    try {
        console.log('Starting thank you image creation...');
        const baseImagePath = 'bg.png';
        try {
            await fs.access(baseImagePath);
            console.log('Base image found');
        } catch (error) {
            throw new Error(`Base image not found at ${baseImagePath}`);
        }

        // Load the base image
        console.log('Loading base image...');
        const baseImage = sharp(baseImagePath);
        const metadata = await baseImage.metadata();
        console.log('Base image metadata:', metadata);

        // Calculate positions
        const overlaySize = 150;
        const spacing = 20;
        // Start from 1/3 of the image width
        const startX = Math.round(metadata.width / 3) + 80;
        const y = Math.round(metadata.height - overlaySize) - 20; // Centered vertically

        console.log('Creating circular masks for profile pictures...');
        const compositeArray = [];
        for (let i = 0; i < imagePaths.length; i++) {
            const circlePath = `./downloads/circle_${i}.png`;
            console.log(`Processing image ${i + 1}/${imagePaths.length}: ${imagePaths[i]}`);

            // Create circular mask
            await sharp(imagePaths[i])
                .resize(overlaySize, overlaySize)
                .composite([{
                    input: Buffer.from(
                        `<svg><circle cx="${overlaySize / 2}" cy="${overlaySize / 2}" r="${overlaySize / 2}" /></svg>`
                    ),
                    blend: 'dest-in'
                }])
                .toFile(circlePath);

            compositeArray.push({
                input: circlePath,
                top: Math.round(y),
                left: Math.round(startX + (i * (overlaySize + spacing)))
            });
        }

        console.log('Creating final composite...');
        console.log('Composite positions:', compositeArray.map(c => ({ top: c.top, left: c.left })));

        await baseImage
            .composite(compositeArray)
            .toFile('thank_you_followers.jpg');

        // Verify output file exists
        await fs.access('thank_you_followers.jpg');
        console.log('Thank you image created and verified successfully!');
        return true;
    } catch (error) {
        console.error('Error creating thank you image:', error);
        console.error('Stack trace:', error.stack);
        return false;
    }
}

async function getFollowersFromPython() {
    return new Promise((resolve, reject) => {
        console.log('Executing Python script...');
        exec('python3 get_followers.py', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`Debug output: ${stderr}`);
            }
            try {
                const followers = JSON.parse(stdout);
                resolve(followers);
            } catch (e) {
                reject(e);
            }
        });
    });
}

async function updateTwitterBanner() {
    return new Promise((resolve, reject) => {
        console.log('Updating Twitter banner using Python script...');
        exec(`python3 get_followers.py update_banner ./thank_you_followers.jpg`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`Debug output: ${stderr}`);
            }
            try {
                const result = JSON.parse(stdout);
                if (result.success) {
                    console.log('Twitter banner updated successfully!');
                    resolve(true);
                } else {
                    console.error('Failed to update banner:', result.error);
                    resolve(false);
                }
            } catch (e) {
                console.error('Error parsing Python script output:', e);
                reject(e);
            }
        });
    });
}

async function main() {
    try {
        // Create downloads directory
        console.log('Creating downloads directory...');
        await fs.mkdir('./downloads', { recursive: true });

        // Get followers
        console.log('Fetching followers...');
        const followers = await getFollowersFromPython();

        if (!followers || followers.error) {
            throw new Error(followers.error || 'Failed to get followers');
        }

        console.log(`Got ${followers.length} followers, taking last 3`);
        const lastThree = followers.slice(0, 3);

        // Download and process images
        console.log('Downloading profile images...');
        const imagePaths = [];
        for (const follower of lastThree) {
            const imagePath = `./downloads/${follower.id}.jpg`;
            const imageUrl = follower.profile_image_url.replace('_normal.', '.');
            console.log(`Processing follower ${follower.name} (${follower.id})`);
            const success = await downloadImage(imageUrl, imagePath);
            if (success) {
                imagePaths.push(imagePath);
            }
        }

        if (imagePaths.length === 0) {
            throw new Error('No images were downloaded successfully');
        }

        console.log(`Successfully downloaded ${imagePaths.length} images`);
        console.log('Image paths:', imagePaths);

        // Create thank you image
        console.log('Creating thank you image...');
        const success = await createThankYouImage(imagePaths);

        if (!success) {
            throw new Error('Failed to create thank you image');
        }

        // Continue with existing banner update
        console.log('Updating Twitter banner...');
        const bannerSuccess = await updateTwitterBanner();
        if (!bannerSuccess) {
            throw new Error('Failed to update Twitter banner');
        }

        // Cleanup
        console.log('Cleaning up temporary files...');
        for (const path of imagePaths) {
            await fs.unlink(path).catch(error =>
                console.error(`Error deleting ${path}:`, error)
            );
        }
        for (let i = 0; i < imagePaths.length; i++) {
            await fs.unlink(`./downloads/circle_${i}.png`).catch(error =>
                console.error(`Error deleting circle_${i}.png:`, error)
            );
        }
        await fs.rmdir('./downloads').catch(error =>
            console.error('Error removing downloads directory:', error)
        );

        console.log('Process completed successfully!');
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

main();
