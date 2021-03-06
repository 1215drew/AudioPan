var tabs = {};

chrome.extension.onConnect.addListener(function(port)
{
	port.onMessage.addListener(function(msg)
	{
		var curTab = msg.tabid;
		
		if (!curTab)
		{
			return;
		}
		
		if (curTab < 0)
		{
			return;
		}
		
		if (!tabs[curTab])
		{
			tabs[curTab] = {};
			tabs[curTab].panning = 0;
			tabs[curTab].enabled = 0;
			tabs[curTab].panNode;
			tabs[curTab].context;
			tabs[curTab].source;
		}
		
		if (msg.type == 'set_request')
		{
			tabs[curTab].panning = msg.value;
			
			if (tabs[curTab].enabled == 0)
			{
				chrome.tabCapture.capture(
				{
					audio: true,
					video: false
				}, function (stream)
				{
					tabs[curTab].context = new AudioContext();
					tabs[curTab].source = tabs[curTab].context.createMediaStreamSource(stream);
					
					tabs[curTab].panNode = tabs[curTab].context.createStereoPanner();
					tabs[curTab].panNode.pan.setValueAtTime(tabs[curTab].panning, tabs[curTab].context.currentTime);
					
					tabs[curTab].source.connect(tabs[curTab].panNode).connect(tabs[curTab].context.destination);
				});
				
				tabs[curTab].enabled = 1;
			}
			else
			{
				tabs[curTab].panNode.pan.setValueAtTime(tabs[curTab].panning, tabs[curTab].context.currentTime);
			}
		}
		else if (msg.type == 'update_request')
		{
			var msgdata = {
				'type':'update_response',
				'value': tabs[curTab].panning,
				'tabid': curTab
			};
			
			port.postMessage(msgdata);
		}
		else if (mst.type == 'resetall_request')
		{
			
		}
	});
});

chrome.tabs.onRemoved.addListener(function(tabid, removed) {
	if (tabs[tabid])
	{
		delete tabs[tabid];
	}
});