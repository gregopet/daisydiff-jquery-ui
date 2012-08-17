// Generated by CoffeeScript 1.3.3

/*
This is a rewrite of a part of the DaisyDiff library located at
http://code.google.com/p/daisydiff/ and contains several unmodified
files form it.

All modifications are authored by Gregor Petrin and are released under the same Apache 2 licence.
*/


(function() {
  var $shownDialog, config, domToXPath, growIgnoreArea, handleShortcut, highlightedChangeId, leftButtonDown, selectedElement, showTip, shrinkIgnoreArea, xPathToDom,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  config = {
    useMouseEnter: true,
    prevKeys: [83, 37, 80],
    nextKeys: [68, 39, 78],
    onIgnoreAreaChange: function() {
      var ignoreAreas;
      ignoreAreas = [];
      $('.ignored_area').each(function() {
        return ignoreAreas.push(domToXPath($(this)));
      });
      return typeof console !== "undefined" && console !== null ? console.log('Ignored areas have changed:', ignoreAreas.join(';')) : void 0;
    }
  };

  selectedElement = null;

  highlightedChangeId = null;

  $shownDialog = null;

  leftButtonDown = false;

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
    var area, areas, ignoreAreas, trackedEvents, _i, _len, _ref;
    $('window').bind('resize', updateOverlays);
    $(document).bind('keydown', handleShortcut);
    selectedElement = $("a[id|='first']")[0];
    trackedEvents = 'keyboardselect click';
    if (config.useMouseEnter) {
      trackedEvents += ' mouseenter';
      $(document).bind("mousedown", function(ev) {
        if (ev.which === 1) {
          return leftButtonDown = true;
        }
      }).bind("mouseup", function(ev) {
        if (ev.which === 1) {
          return leftButtonDown = false;
        }
      });
    }
    if (config.onIgnoreAreaChange) {
      ignoreAreas = $('body').data('ignoreexpressions');
      if (ignoreAreas) {
        areas = ignoreAreas.split(';');
        if (areas.length) {
          xPathToDom(areas[0]);
        }
        for (_i = 0, _len = areas.length; _i < _len; _i++) {
          area = areas[_i];
          if ((_ref = xPathToDom(area)) != null) {
            _ref.addClass('ignored_area');
          }
        }
      }
    }
    $("span[class|='diff-html']").bind(trackedEvents, showTip).each(function() {
      var backgroundColor;
      backgroundColor = $(this).css('background-color');
      return $(this).css('background-color', backgroundColor);
    });
    return $('.diffpage-html-a').bind('click', showTip);
  });

  showTip = function(ev) {
    var $contents, $target, changeDescription, changeType, change_id, change_number, dialogBottom, dialogTop, href, next_id, previous_id, targetOffset, targetWidth, viewportBottom, viewportTop, _ref, _ref1;
    if (ev.type === 'mouseenter' && leftButtonDown) {
      return;
    }
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
    $contents.append($("<table class='" + (changeType === 'Change' ? 'diff-tooltip-link-changed' : 'diff-tooltip-link') + "'>\n	<tr>\n		<td class='diff-tooltip-prev'>\n			<a class='diffpage-html-a diff-goto-previous' href='#" + previous_id + "' title='Go to previous.'></a>\n		</td>\n		<td class='diff-name'>\n			&#160;<a href='#" + change_id + "'>#" + change_id + "</a>&#160;\n		</td>\n		<td class='diff-tooltip-next'>\n			<a class='diffpage-html-a diff-goto-next' href='#" + next_id + "' title='Go to next.'></a>\n		</td>\n	</tr>\n</table>"));
    $contents.find('.diffpage-html-a').click(showTip);
    $contents.find("a[href='#first-diff'], a[href='#last-diff']").remove();
    if (config.onIgnoreAreaChange) {
      $contents.find('.diff-name').empty().append("<p class='diff-ignore-header'>ignore</p>\n<p class='diff-ignore-toolbar'>\n	<a href=\"#\" class=\"grow_ignore_area\" title=\"Grow ignore area\">more</a>\n	<a href=\"#\" class=\"shrink_ignore_area\" title=\"Shrink ignore area\">less</a>\n</p>");
      $contents.find('.grow_ignore_area').click(function() {
        growIgnoreArea($target);
        return false;
      });
      $contents.find('.shrink_ignore_area').click(function() {
        shrinkIgnoreArea($target);
        return false;
      });
    }
    if ($shownDialog != null) {
      if ((_ref = $shownDialog.dialog('close')) != null) {
        if ((_ref1 = _ref.dialog('destroy')) != null) {
          _ref1.remove();
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
      if (_ref = e.keyCode, __indexOf.call(config.prevKeys, _ref) >= 0) {
        target = selectedElement != null ? selectedElement.getAttribute("previous") : void 0;
      } else if (_ref1 = e.keyCode, __indexOf.call(config.nextKeys, _ref1) >= 0) {
        target = selectedElement != null ? selectedElement.getAttribute("next") : void 0;
      }
      if (target) {
        return $("#" + target).trigger('keyboardselect');
      }
    }
  };

  growIgnoreArea = function($target) {
    var $nearestIgnoreArea;
    $nearestIgnoreArea = $target.closest('.ignored_area');
    if ($nearestIgnoreArea.is('body, html')) {
      return;
    }
    if ($nearestIgnoreArea.length === 0) {
      $nearestIgnoreArea = $target;
    }
    $nearestIgnoreArea.removeClass('ignored_area');
    $nearestIgnoreArea.parent().addClass('ignored_area');
    return config.onIgnoreAreaChange();
  };

  shrinkIgnoreArea = function($target) {
    var $nearestIgnoreArea;
    $nearestIgnoreArea = $target.parentsUntil('.ignored_area').last();
    if ($nearestIgnoreArea.is('html') || $nearestIgnoreArea.length === 0) {
      if ($target.parent().hasClass('ignored_area')) {
        $target.parent().removeClass('ignored_area');
        return config.onIgnoreAreaChange();
      }
    } else {
      $nearestIgnoreArea.addClass('ignored_area');
      $nearestIgnoreArea.parent().removeClass('ignored_area');
      return config.onIgnoreAreaChange();
    }
  };

  domToXPath = function($ignoreArea) {
    var previousSiblings, xslExpression;
    xslExpression = '';
    while (!$ignoreArea.is('body')) {
      previousSiblings = $ignoreArea.prevAll().length;
      xslExpression = ("/*[" + (previousSiblings + 1) + "]") + xslExpression;
      $ignoreArea = $ignoreArea.parent();
    }
    return xslExpression = '.' + xslExpression;
  };

  xPathToDom = function(xslExpression) {
    var elements, targetElement;
    elements = document.evaluate(xslExpression, document.body, null, XPathResult.ANY_TYPE, null);
    targetElement = elements.iterateNext();
    return $(targetElement);
  };

}).call(this);
