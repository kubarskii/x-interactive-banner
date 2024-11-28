from typing import Any
from httpx import Response

def extend_v11_client(V11Client):
    """Extends the V11Client class with banner update functionality"""
    
    async def account_update_profile_banner(
        self,
        media_id: str,
        width: int = 1500,
        height: int = 500,
        offset_left: int = 0,
        offset_top: int = 0
    ) -> tuple[dict[str, Any], Response]:
        """
        Updates the authenticating user's profile banner.
        
        Parameters
        ----------
        media_id : str
            The ID of the uploaded media to use as the banner
        width : int, default=1500
            The width of the banner image
        height : int, default=500
            The height of the banner image
        offset_left : int, default=0
            The offset from the left edge of the image
        offset_top : int, default=0
            The offset from the top edge of the image
        
        Returns
        -------
        tuple[dict[str, Any], Response]
            The response data and raw response
        """
        return await self.client.post(
            'https://api.twitter.com/1.1/account/update_profile_banner.json',
            data={
                'media_id': media_id,
                'width': width,
                'height': height,
                'offset_left': offset_left,
                'offset_top': offset_top
            },
            headers=self.client._base_headers
        )
    
    # Add the new method to the V11Client class
    setattr(V11Client, 'account_update_profile_banner', account_update_profile_banner)

# Import and apply the extension where you initialize your client
from twikit.client.v11 import V11Client
extend_v11_client(V11Client) 