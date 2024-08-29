using Microsoft.AspNetCore.SignalR;

namespace ChatApp.MVC.SignalR.Hubs
{
    public class ShareHub : Hub
    {
        public async Task Share(string user, string message)
        {
            //await Clients.All.SendAsync("receive", user, message);
            await Clients.Caller.SendAsync("selfMsg", message);
            await Clients.Others.SendAsync("msgRcv", user, message);

        }

        public async Task ShareImage(string user, string message, string imageData)
        {
            //await Clients.All.SendAsync("receive", user, message);
            await Clients.Caller.SendAsync("imgRcv", user, imageData);
            await Clients.Others.SendAsync("imgRcv", user, imageData);

            if (!string.IsNullOrEmpty(message))
            {
                await Share(user, message); // Send the message along with the image
            }

        }

        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            return base.OnDisconnectedAsync(exception);
        }
    }
}
