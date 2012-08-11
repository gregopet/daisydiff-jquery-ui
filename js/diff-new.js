(function() {
  var $shownDialog, handleShortcut, highlightedChangeId, nextKeys, prevKeys, selectedElement, showTip;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  selectedElement = null;
  highlightedChangeId = null;
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
  window.htmlDiffInit = function() {
    return true;
  };
  $(function() {
    $('window').bind('resize', updateOverlays);
    $(document).bind('keydown', handleShortcut);
    selectedElement = $("a[id|='first']")[0];
    $("span[class|='diff-html']").bind('mouseenter keyboardselect click', showTip);
    return $('.diffpage-html-a').bind('click', showTip);
  });
  showTip = function(ev) {
    var $contents, $target, changeDescription, changeType, change_id, change_number, dialogBottom, dialogTop, href, next_id, previous_id, targetOffset, targetWidth, viewportBottom, viewportTop, _ref, _ref2;
    $target = $(ev.delegateTarget);
    href = $target.attr('href');
    if (href) {
      $target = $(href);
    }
    previous_id = $target.attr("previous");
    next_id = $target.attr("next");
    change_id = $target.attr("changeId");
    change_number = parseInt(/\d+/.exec(change_id)[0], 10) + 1;
    if (highlightedChangeId === change_id) {
      return false;
    }
    selectedElement = $target[0];
    changeType = "Change";
    if ($target.hasClass('diff-html-removed')) {
      changeType = "Removal";
    }
    if ($target.hasClass('diff-html-added')) {
      changeType = "Addition";
    }
    changeDescription = $target.attr("changes");
    changeDescription = changeDescription != null ? changeDescription.replace(/<br\/><br\/>/g, '<br/>') : void 0;
    $contents = $("<div></div>");
    if (changeDescription) {
      $contents.append($(changeDescription));
    }
    $contents.append($("<table class='" + (changeType === 'Change' ? 'diff-tooltip-link-changed' : 'diff-tooltip-link') + "'>\n	<tr>\n		<td class='diff-tooltip-prev'>\n			<a class='diffpage-html-a diff-goto-previous' href='#" + previous_id + "' title='Go to previous.'></a>\n		</td>\n		<td>\n			&#160;<a href='#" + change_id + "'>#" + change_id + "</a>&#160;\n		</td>\n		<td class='diff-tooltip-next'>\n			<a class='diffpage-html-a diff-goto-next' href='#" + next_id + "' title='Go to next.'></a>\n		</td>\n	</tr>\n</table>"));
    $contents.find('.diffpage-html-a').click(showTip);
    $contents.find("a[href='#first-diff'], a[href='#last-diff']").remove();
    if ($shownDialog != null) {
      if ((_ref = $shownDialog.dialog('close')) != null) {
        if ((_ref2 = _ref.dialog('destroy')) != null) {
          _ref2.remove();
        }
      }
    }
    targetOffset = $(ev.target).offset();
    targetWidth = $(ev.target).width();
    $shownDialog = $("<div class='diff-dialog'></div>").append($contents).dialog({
      minHeight: 20,
      minWidth: 50,
      width: 'auto',
      maxWidth: 400,
      title: changeType + " " + change_number,
      open: function() {
        $target.addClass('diff-html-selected');
        $("span[changeId='" + change_id + "']").addClass('diff-html-selected');
        return highlightedChangeId = change_id;
      },
      beforeClose: function() {
        $('.diff-html-selected').removeClass('diff-html-selected');
        return highlightedChangeId = null;
      }
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
    dialogBottom = dialogTop + $shownDialog.dialog("widget").height();
    if (dialogTop < viewportTop) {
      $('html, body').animate({
        scrollTop: dialogTop
      }, {
        duration: 500,
        queue: false
      });
    } else if (viewportBottom < dialogBottom) {
      $('html, body').animate({
        scrollTop: dialogBottom - (viewportBottom - viewportTop) + 20
      }, {
        duration: 500,
        queue: false
      });
    }
    return false;
  };
  window.updateOverlays = function() {
    var existingDivs, filter, image, _i, _len, _ref, _ref2, _results;
    _ref = document.getElementsByTagName("img");
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      image = _ref[_i];
      _results.push((_ref2 = image.getAttribute('changeType')) === "diff-removed-image" || _ref2 === "diff-added-image" ? (filter = null, existingDivs = image.parentNode.getElementsByTagName('div'), existingDivs.length > 0 && existingDivs[0].className === image.getAttribute("changeType") ? filter = existingDivs[0] : (filter = document.createElement("div"), filter.className = image.getAttribute("changeType")), filter.style.width = image.offsetWidth - 4 + "px", filter.style.height = image.offsetHeight - 4 + "px", image.y && image.x ? (filter.style.top = image.y + "px", filter.style.left = image.x - 1 + "px") : void 0, existingDivs.length === 0 ? image.parentNode.insertBefore(filter, image) : void 0) : void 0);
    }
    return _results;
  };
  handleShortcut = function(e) {
    var target, _ref, _ref2;
    if (e.target.tagName.toLowerCase() !== 'input') {
      target = null;
      if (_ref = e.keyCode, __indexOf.call(prevKeys, _ref) >= 0) {
        target = selectedElement != null ? selectedElement.getAttribute("previous") : void 0;
      } else if (_ref2 = e.keyCode, __indexOf.call(nextKeys, _ref2) >= 0) {
        target = selectedElement != null ? selectedElement.getAttribute("next") : void 0;
      }
      if (target) {
        return $("#" + target).trigger('keyboardselect');
      }
    }
  };
}).call(this);
