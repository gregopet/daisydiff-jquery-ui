###
This is a rewrite of a part of the DaisyDiff library located at
http://code.google.com/p/daisydiff/ and contains several unmodified
files form it.

All modifications are authored by Gregor Petrin and are released under the same Apache 2 licence.
###


selectedElement = null #currently selected diff DOM element, needed for keyboard nav
highlightedChangeId = null #keep track of currently highlighted element
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
window.htmlDiffInit = () -> true

#set everything up on jQuery ready event
$ ->
	$('window').bind 'resize', updateOverlays
	$(document).bind 'keydown', handleShortcut
	selectedElement = $("a[id|='first']")[0] #select first element

	$("span[class|='diff-html']").bind 'mouseenter keyboardselect click', showTip #mouseenter might be undesired in change-rich cases
	$('.diffpage-html-a').bind 'click', showTip #first and last case arrows should work on click, not mouseenter

#show & create a tooltip, scroll to it
#ev either contains a span or a link with the parameter 'link-target'
showTip = (ev) ->
	$target = $(ev.delegateTarget)
	
	#was it a link to the actual change marker?
	href = $target.attr('href')
	if (href) then $target = $(href)

	#extract properties
	previous_id = $target.attr("previous")
	next_id = $target.attr("next")
	change_id = $target.attr("changeId")
	change_number = parseInt(/\d+/.exec(change_id)[0], 10) + 1

	#prevent multi-node changelogs from moving the change summary dialog
	if (highlightedChangeId == change_id) then return false

	#change the current selection (for keyboard nav)
	selectedElement = $target[0]

	#what kind of dialog is it?
	changeType = "Change"
	if $target.hasClass('diff-html-removed') then changeType = "Removal"
	if $target.hasClass('diff-html-added') then changeType = "Addition"

	#is there a description of the changes?
	changeDescription = $target.attr("changes")
	changeDescription = changeDescription?.replace(/<br\/><br\/>/g, '<br/>') #daisy diff outputs double line breaks, presumably a bug?
	
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

	#hide the old & show the new dialog
	$shownDialog?.dialog('close')?.dialog('destroy')?.remove() #HAS to be called here because closing the dialog resets highlightedChangeId
	targetOffset = $(ev.target).offset()
	targetWidth = $(ev.target).width()
	$shownDialog = $("<div class='diff-dialog'></div>").append($contents).dialog
		minHeight   : 20
		minWidth    : 50
		width       : 'auto'
		maxWidth    : 400
		title       : changeType + " " + change_number
		open        : () ->
			$target.addClass('diff-html-selected')
			$("span[changeId='#{change_id}']").addClass('diff-html-selected') #this may turn out to be slow for big documents?
			highlightedChangeId = change_id
		beforeClose : () ->
			$('.diff-html-selected').removeClass('diff-html-selected') #easy way out, should be fast enough
			highlightedChangeId = null

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
	dialogBottom = dialogTop + $shownDialog.dialog("widget").height()
	if dialogTop < viewportTop
		$('html, body').animate {scrollTop : dialogTop}, {duration:500, queue:false}
	else if viewportBottom < dialogBottom
		$('html, body').animate {scrollTop : dialogBottom - (viewportBottom - viewportTop) + 20}, {duration:500, queue:false}

	#prevent browser default
	return false

# puts overlays over pictures - unchanged from it diff.js original
window.updateOverlays = () ->
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