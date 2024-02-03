import axios from 'axios';


export async function useYoutubeFetch(videoId) {

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=AIzaSyAf2TUgF_VOrTzKOHANw2UAL8GYp3LcS1E&part=snippet`;

    try {
        const response = await axios.get(apiUrl);
        const videoInfo = response.data.items[0].snippet;

        const publishedAt = new Date(videoInfo.publishedAt);
        const currentTime = new Date();

        // Calculate the time difference in seconds
        const timeDifferenceSeconds = Math.floor((currentTime - publishedAt) / 1000);

        console.log(timeDifferenceSeconds)
        return timeDifferenceSeconds

    } catch (error) {
        console.error('Error fetching video information:', error.message);
    }
}

// Call the function
const time = useYoutubeFetch();
