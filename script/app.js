var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

function escapeHTML(string) {
	return String(string).replace(/[&<>"'\/]/g, function (s) {
		return entityMap[s];
	});
}
  
function saveTextAsFile(textToWrite,fileNameToSaveAs)
{
	var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs;
	downloadLink.innerHTML = "Download File";
	if (window.webkitURL != null)
	{
		// Chrome allows the link to be clicked
		// without actually adding it to the DOM.
		downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	}
	else
	{
		// Firefox requires the link to be added to the DOM
		// before it can be clicked.
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
	}

	downloadLink.click();
}

function destroyClickedElement(event)
{
	document.body.removeChild(event.target);
}
  
$(document).ready(function(){
	$('#inputForm').submit(function(){ return false; });
	
	$('#getAllArticle').click(function(){
		$('.loading').show("slow");
		$('#result').hide("slow", function(){
			$.get( "http://www.wretch.cc/blog/" + $('#username').val() + "%26list%3D1", function(data){
				data = data.responseText;
				
				$('#result').html("<ul><h2>文章列表：</h2></ul>");
				var $content = $(data).find(".blogbody table tr");
				$content.each(function(){
					var tdContent = $(this).find("td").html();
					$('#result ul').append("<li>" + tdContent + "</li>");
				});
				$('.loading').hide("slow", function(){ $('#result').show("slow") });
				
			});
		});
		return false;
	});
	
	$('#getAtomFormat').click(function(){
		var username = $('#username').val();
		var second = parseInt($('#interval').val()) * 1000;
		if( !second ) second = 5000;
		$('.loading').show("slow");
		$('#result').hide("slow",function(){
			$.get( "http://www.wretch.cc/blog/" + username + "%26list%3D1", function(data){
				data = data.responseText;
					$('#result').html("<h2>RAW Data：</h2><p>完成會跳出存檔視窗</p><div id='progress'></div>");
					$('.loading').hide("slow", function(){ $('#result').show("slow") });
					var $display = $('#progress');
					var RSSContent = '<?xml version="1.0" encoding="UTF-8"?><wretch>';
					var $content = $(data).find(".blogbody table tr");
					$content.each(function(index){
						var self = this;
						setTimeout( function(){
						var aContent = $(self).find("a");
						$.get( $(aContent).attr("href"), function(data){
								RSSContent += "<page>";
								RSSContent += escapeHTML(data.responseText);
								RSSContent += "</page>";
								if(index >= $content.length-1){
									RSSContent += "</wretch>";
									saveTextAsFile(RSSContent, (new Date())+"_"+username+".xml");
								}
								$display.html("進度：" + ((index+1) / $content.length * 100) + "%" );
						});
					}, index * second);});
					
			});	
		});
		return false;
	});
});