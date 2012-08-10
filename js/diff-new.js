// Generated by CoffeeScript 1.3.3
var $shownDialog, handleShortcut, nextKeys, prevKeys, selectedElement, showTip, updateOverlays,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

selectedElement = null;

$shownDialog = null;

prevKeys = [83, 37, 80];

nextKeys = [68, 39, 78];

window.tipC = function(content) {
  return true;
};

window.tipA = function(content) {
  return true;
};

window.tipR = function(content) {
  return true;
};

window.constructToolTipC = function(elem) {
  return true;
};

window.constructToolTipA = function(elem) {
  return true;
};

window.constructToolTipR = function(elem) {
  return true;
};

window.scrollToEvent = function(elem) {
  return true;
};

$(function() {
  var changedParts;
  $('window').bind('resize', updateOverlays);
  $(document).bind('keydown', handleShortcut);
  selectedElement = $("a[id|='first']")[0];
  changedParts = $("span[class|='diff-html']");
  return changedParts.bind('mouseenter keyboardselect click', showTip);
});

showTip = function(ev) {
  var $contents, $target, changeDescription, changeType, change_id, change_number, dialogTop, href, next_id, previous_id, targetOffset, targetWidth, viewportBottom, viewportTop, _ref, _ref1;
  $target = $(ev.target);
  href = $target.attr('href');
  if (href) {
    $target = $(href);
  }
  previous_id = $target.attr("previous");
  next_id = $target.attr("next");
  change_id = $target.attr("changeId");
  change_number = parseInt(/\d+/.exec(change_id)[0], 10) + 1;
  $('.diff-html-selected').removeClass('diff-html-selected');
  $("span[changeId='" + change_id + "']").addClass('diff-html-selected');
  selectedElement = $target[0];
  $(selectedElement).addClass('diff-html-selected');
  changeType = "Change";
  if ($target.hasClass('diff-html-removed')) {
    changeType = "Removal";
  }
  if ($target.hasClass('diff-html-added')) {
    changeType = "Addition";
  }
  changeDescription = $target.attr("changes");
  changeDescription = changeDescription.replace(/<br\/><br\/>/g, '<br/>');
  $contents = $("<div></div>");
  if (changeDescription) {
    $contents.append($(changeDescription));
  }
  $contents.append($("<table class='" + (changeType === 'Change' ? 'diff-tooltip-link-changed' : 'diff-tooltip-link') + "'>\n	<tr>\n		<td class='diff-tooltip-prev'>\n			<a class='diffpage-html-a diff-goto-previous' href='#" + previous_id + "' title='Go to previous.'></a>\n		</td>\n		<td>\n			&#160;<a href='#" + change_id + "'>#" + change_id + "</a>&#160;\n		</td>\n		<td class='diff-tooltip-next'>\n			<a class='diffpage-html-a diff-goto-next' href='#" + next_id + "' title='Go to next.'></a>\n		</td>\n	</tr>\n</table>"));
  $contents.find('.diffpage-html-a').click(showTip);
  $contents.find("a[href='#first-diff'], a[href='#last-diff']").remove();
  targetOffset = $(ev.target).offset();
  targetWidth = $(ev.target).width();
  if ($shownDialog != null) {
    if ((_ref = $shownDialog.dialog('close')) != null) {
      if ((_ref1 = _ref.dialog('destroy')) != null) {
        _ref1.remove();
      }
    }
  }
  $shownDialog = $("<div class='diff-dialog'></div>").append($contents).dialog({
    minHeight: 20,
    minWidth: 50,
    width: 'auto',
    maxWidth: 400,
    title: changeType + " " + change_number
  });
  $shownDialog.dialog("widget").position({
    'my': "left top",
    'at': "right top",
    'of': $target,
    'offset': "20 0",
    'collision': "fit none"
  });
  viewportTop = $(window).scrollTop();
  viewportBottom = viewportTop + $(window).height();
  dialogTop = $shownDialog.dialog("widget").offset().top;
  if (!((viewportBottom >= dialogTop && dialogTop >= viewportTop))) {
    $('html, body').animate({
      scrollTop: dialogTop
    }, {
      duration: 500,
      queue: false
    });
  }
  return false;
};

updateOverlays = function() {
  var existingDivs, filter, image, _i, _len, _ref, _ref1, _results;
  _ref = document.getElementsByTagName("img");
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    image = _ref[_i];
    if ((_ref1 = image.getAttribute('changeType')) === "diff-removed-image" || _ref1 === "diff-added-image") {
      filter = null;
      existingDivs = image.parentNode.getElementsByTagName('div');
      if (existingDivs.length > 0 && existingDivs[0].className === image.getAttribute("changeType")) {
        filter = existingDivs[0];
      } else {
        filter = document.createElement("div");
        filter.className = image.getAttribute("changeType");
      }
      filter.style.width = image.offsetWidth - 4 + "px";
      filter.style.height = image.offsetHeight - 4 + "px";
      if (image.y && image.x) {
        filter.style.top = image.y + "px";
        filter.style.left = image.x - 1 + "px";
      }
      if (existingDivs.length === 0) {
        _results.push(image.parentNode.insertBefore(filter, image));
      } else {
        _results.push(void 0);
      }
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

handleShortcut = function(e) {
  var target, _ref, _ref1;
  if (e.target.tagName.toLowerCase() !== 'input') {
    target = null;
    if (_ref = e.keyCode, __indexOf.call(prevKeys, _ref) >= 0) {
      target = selectedElement != null ? selectedElement.getAttribute("previous") : void 0;
    } else if (_ref1 = e.keyCode, __indexOf.call(nextKeys, _ref1) >= 0) {
      target = selectedElement != null ? selectedElement.getAttribute("next") : void 0;
    }
    if (target) {
      return $("#" + target).trigger('keyboardselect');
    }
  }
};
