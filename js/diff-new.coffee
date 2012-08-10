selectedElement = null #currently selected diff DOM element, needed for keyboard nav 
$shownDialog = null #the currently displayed dialog (can be null!)
prevKeys = [83, 37, 80] #s, <- and p move to previous change
nextKeys = [68, 39, 78] #d, -> and n move to next change

#functions to prevent default daisydiff from throwing exceptions
window.tipC = (content) -> true
window.tipA = (content) -> true
window.tipR = (content) -> true
window.constructToolTipC = (elem) -> true
window.constructToolTipA = (elem) -> true
window.constructToolTipR = (elem) -> true
window.scrollToEvent = (elem) -> true

#set everything up on jQuery ready event
$ ->
	$('window').bind 'resize', updateOverlays
	$(document).bind 'keydown', handleShortcut
	selectedElement = $("a[id|='first']")[0] #select first element

	changedParts = $("span[class|='diff-html']")
	changedParts.bind 'mouseenter keyboardselect', showTip
		#.mousemove (e) ->
		#	$shownDialog.dialog('option', 'position', [e.x, e.y])

#show & create a tooltip, scroll to it
#ev either contains a span or a link with the parameter 'link-target'
showTip = (ev) ->
	$target = $(ev.target)
	
	#was it a link to the actual change marker?
	href = $target.attr('href')
	if (href) then $target = $(href)

	#extract properties
	previous_id = $target.attr("previous")
	next_id = $target.attr("next")
	change_id = $target.attr("changeId")
	change_number = parseInt(/\d+/.exec(change_id)[0], 10) + 1
	
	#remove any previously marked elements & mark this one
	$('.diff-html-selected').removeClass('diff-html-selected') #easy way out, should be fast enough
	$("span[changeId='#{change_id}']").addClass('diff-html-selected') #this may turn out to be slow for big documents?

	#change the current selection (for keyboard nav)
	selectedElement = $target[0]
	$(selectedElement).addClass('diff-html-selected')


	#what kind of dialog is it?
	changeType = "Change"
	if $target.hasClass('diff-html-removed') then changeType = "Removal"
	if $target.hasClass('diff-html-added') then changeType = "Addition"

	#is there a description of the changes?
	changeDescription = $target.attr("changes")

	#create dialog content...
	$contents = $("<div></div>")
	if changeDescription then $contents.append $(changeDescription)
	$contents.append $ """
	<table class='#{if changeType == 'Change' then 'diff-tooltip-link-changed' else 'diff-tooltip-link'}'>
		<tr>
			<td class='diff-tooltip-prev'>
				<a class='diffpage-html-a diff-goto-previous' href='##{previous_id}' title='Go to previous.'></a>
			</td>
			<td>
				&#160;<a href='##{change_id}'>##{change_id}</a>&#160;
			</td>
			<td class='diff-tooltip-next'>
				<a class='diffpage-html-a diff-goto-next' href='##{next_id}' title='Go to next.'></a>
			</td>
		</tr>
	</table>
	"""

	#enable navigation by clicking arrows
	$contents.find('.diffpage-html-a').click showTip

	#hide first & last change arrows
	$contents.find("a[href='#first-diff'], a[href='#last-diff']").remove()

	#hide any previous dialogs, show the new one
	targetOffset = $(ev.target).offset()
	targetWidth = $(ev.target).width()
	$shownDialog?.dialog('close')?.dialog('destroy')?.remove()
	$shownDialog = $("<div class='diff-dialog'></div>").append($contents).dialog
		minHeight   : 20
		minWidth    : 50
		width       : 'auto'
		maxWidth    : 400
		title       : changeType + " " + change_number

	#set the dialog's position
	$shownDialog.dialog("widget").position
		'my'        : "left top"
		'at'        : "right top"
		'of'        : $target
		'offset'    : "20 0"
		'collision' : "fit none"

	#scroll target if needed
	viewportTop = $(window).scrollTop()
	viewportBottom = viewportTop + $(window).height()
	dialogTop = $shownDialog.dialog("widget").offset().top
	unless viewportBottom >= dialogTop >= viewportTop
		$('html, body').animate {scrollTop : dialogTop}, {duration:500, queue:false}

	#prevent browser default
	return false

# puts overlays over pictures - unchanged from it diff.js original
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
			$("##{target}").trigger('keyboardselect')