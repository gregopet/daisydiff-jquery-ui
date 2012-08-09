imagePath = 'oldimages/'
changes = []
selectedElement = null #currently selected diff DOM element
$shownDialog = null
prevKeys = [83, 37, 80] #s, <- and p move to previous change
nextKeys = [68, 39, 78] #d, -> and n move to next change

#jQuery ready event
$ ->
	$('window').bind 'resize', updateOverlays
	$(document).bind 'keydown', handleShortcut
	selectedElement = $("a[id|='first']")[0] #select first element

#show & create a tooltip
window.tipC = (content) -> showTip(content)
window.tipA = (content) -> showTip(content)
window.tipR = (content) -> showTip(content)
showTip = (content) ->
	$shownDialog?.dialog('close')?.dialog('destroy')
	$shownDialog = $("<div class='diff-dialog'>#{content}</div>").dialog()
	#put scrolling code here?
	false

# create a tooltip when clicking on a change link
window.constructToolTipC = (elem) -> constructTooltip(elem)
window.constructToolTipA = (elem) -> constructTooltip(elem)
window.constructToolTipR = (elem) -> constructTooltip(elem)
constructTooltip = (elem) ->
	selectedElement = elem #change the current selection
	
	#prepare tooltip attributes
	previous_id = elem.getAttribute("previous")
	next_id = elem.getAttribute("next")
	change_id = elem.getAttribute("changeId")

	#what kind of dialog is it?
	dialogChangedType = $(elem).hasClass('diff-html-changed')
	dialogClass = if dialogChangedType then 'diff-tooltip-link-changed' else 'diff-tooltip-link'
	changeHtml = if dialogChangedType then elem.getAttribute("changes") else ''
	"""
	#{changeHtml}
	<table class='#{dialogClass}'>
		<tr>
			<td class='diff-tooltip-prev'>
				<a class='diffpage-html-a' href='##{previous_id}' onClick='scrollToEvent(event)'><img class='diff-icon' src='#{imagePath}diff-previous.gif' title='Go to previous.'/></a>
			</td>
			<td>
				&#160;<a href='##{change_id}'>##{change_id}</a>&#160;
			</td>
			<td class='diff-tooltip-next'>
				<a class='diffpage-html-a' href='##{next_id}' onClick='scrollToEvent(event)'><img class='diff-icon' src='#{imagePath}diff-next.gif' title='Go to next.'/></a>
			</td>
		</tr>
	</table>
	"""

# puts overlays over pictures
updateOverlays = () ->
	for image in document.getElementsByTagName("img")
		if image.getAttribute('changeType') in ["diff-removed-image", "diff-added-image"]
			filter = null
			existingDivs = image.parentNode.getElementsByTagName('div')
			if(existingDivs.length > 0 && existingDivs[0].className==image.getAttribute("changeType"))
				filter = existingDivs[0]
			else
				filter = document.createElement("div")
				filter.className= image.getAttribute("changeType")

			filter.style.width = image.offsetWidth-4 + "px"
			filter.style.height = image.offsetHeight-4 + "px"
			if (image.y && image.x)  # this check is needed for IE
				filter.style.top = image.y + "px"
				filter.style.left = image.x-1 + "px"

			if (existingDivs.length == 0 )
				image.parentNode.insertBefore(filter, image)



#handles keyboard shortcuts
handleShortcut = (e) ->
	unless e.target.tagName.toLowerCase() == 'input'
		target = null
		if e.keyCode in prevKeys
			target = selectedElement?.getAttribute("previous")
		else if e.keyCode in nextKeys
			target = selectedElement?.getAttribute("next")
		if target
			destinationLink = document.getElementById(target)
			scrollToTarget(destinationLink) if destinationLink

window.scrollToEvent = (e) ->
	#Make sure that the target is an element, not a text node within an element
	if (e.target.nodeType == 3 || e.target.nodeName.toLowerCase()=="img")
		e.target = e.target.parentNode

	# Paranoia; check this is an A tag
	if (e.target.nodeName.toLowerCase() != 'a')
			throw("target is not an anchor")
			return true

	#Find the <span> tag corresponding to this href
	#First strip off the hash (first character)
	anchor = e.target.hash.substr(1)

	#custom hack for span support
	destinationLink = document.getElementById(anchor)
	scrollToTarget(destinationLink)

#Scrolls to clicked target. Returns false if event propagation is to be stopped
#Destination link is a DOM element
window.scrollToTarget = (destinationLink) ->
	unless destinationLink
		throw "Unknown destination"
		return true

	xy = FixCalcXY(destinationLink, 0,-10)
	window.scrollTo( xy[0], xy[1])
	setTimeout (() ->
		showTip constructTooltip(destinationLink)
	), 0

	#if, because otherwise it's not threadsafe-ish
	if(destinationLink.className != "diff-html-selected")
		if(selectedElement.getAttribute("oldClass") && selectedElement.getAttribute("oldClass").length>0 && selectedElement.getAttribute("oldClass")!=selectedElement.className)
			$("span[changeId='#{selectedElement.id}']")[0]?.className = selectedElement.getAttribute("oldClass")

		setTimeout (-> $("span[changeId='#{selectedElement.id}']")[0]?.className = 'diff-html-selected'), 1
		destinationLink.setAttribute("oldClass",destinationLink.className)
		setTimeout (-> $("span[changeId='#{destinationLink.id}']")[0]?.className = destinationLink.className), 2000

	return false #please do prevent default

FixCalcXY = (el, xoffset, yoffset) ->
	#fix for images inside the span
	imagesContained = el.getElementsByTagName("img")

	imageHeight=0
	if(!window.event && imagesContained.length > 0)
		imageHeight=imagesContained[0].offsetHeight

	xy = $(el).offset()
	return [xy.left+xoffset, xy.top+yoffset-imageHeight]