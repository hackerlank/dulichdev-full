// Copyright 2011 Google Inc.
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301,
// USA.

/**
 * @fileoverview The chapter navigation is located below the book, and is used
 * to jump between the first pages of the different chapters in the book. Note
 * that this component is not visible on the home page if you are a first time
 * visitor. It's important to keep the number of interactions availble on the
 * home page limited before the user gets a sense for how the application works.
 * @author hakim.elhattab@f-i.com (Hakim El Hattab)
 * @author erik.kallevig@f-i.com (Erik Kallevig)
 */


/**
 * Sub-namespace.
 * @type {Object}
 */
TT.chapternav = {};


/**
 * Register listeners.
 */
TT.chapternav.initialize = function() {

  // Register event listeners.
  $('#chapter-nav ul li').click(TT.chapternav.onChapterClick);

  if (!TT.IS_TOUCH_DEVICE) {
    $('#chapter-nav ul li').mouseover(TT.chapternav.onChapterMouseOver);
    $('#chapter-nav ul li').mouseout(TT.chapternav.onChapterMouseOut);
  }

  $('#chapter-nav ul li .over div.description').css({ opacity: 0 });

};


/**
 * Updates which chapters that are marked as read.
 */
TT.chapternav.updateReadMarkers = function() {
  $('#chapter-nav ul li').each(function() {
    var articleId = $('a', this).attr('data-article');

    if (TT.storage.hasArticleBeenRead(articleId)) {
      $(this).addClass('read');
    }
  });
};


/**
 * Returns a list containing the ID's of all disabled articles.
 * @return {Array} Array of disabled article ID's.
 */
TT.chapternav.getDisabledArticles = function() {
  var articles = [];

  $('#chapter-nav ul li.disabled').each(function() {
    var article = $('a', this).attr('data-article');
    if (article) {
      articles.push(article);
    }
  });

  return articles;
};


/**
 * Updates the selection in the chapter navigation. By default, this will select
 * the chapter navigation item that corresponds to the currently selected page.
 * @param {String=} overrideArticleId If this is specified, the
 *     chapter navigation item that corresponds to this ID will be selected.
 */
TT.chapternav.updateSelection = function(overrideArticleId) {

  // Fetch the article name of the currently selected page.
  var selectedArticleId = TT.navigation.classToArticle(
      $('#pages section.current').attr('class'));

  // If an override article ID is specified, use that instead of the current
  // page.
  if (overrideArticleId) {
    selectedArticleId = overrideArticleId;
  }

  // Remove selection from all elements
  $('#chapter-nav ul li').removeClass('selected');

  // If the selected article is valid, find the corresponding element and select
  // it.
  if (selectedArticleId && !TT.navigation.isHomePage() &&
      !TT.navigation.isCreditsPage() && !TT.navigation.isForeword()) {
    var element =
        $('#chapter-nav ul li').find('[data-article=' +
            selectedArticleId + ']');

    if (element && element.parent()) {
      element.parent().addClass('selected');

      // Update the sharer to match the current index.
      TT.sharing.updateSharerIndex(element.parent().index() + 1);
    }
  }

  // Show the chapter nav if applicable.
  if (!TT.storage.isFirstTimeVisitor || !TT.navigation.isHomePage() ||
      TT.navigation.hasNavigated) {
    //$('#chapter-nav').show();
  }

  // Re-align all mouse over components.
  $('#chapter-nav ul li a.over').each(function() {
    $(this).css({ top: -$(this).height() + 4 });
  });
};


/**
 * Calculates the progress of reading on a 0-1 scale. For example, if we are on
 * the first page this will return 0, if we are on the middle page it return
 * 0.5.
 * @param {String=} overrideArticleId If this is specified, the progress
 *     returned will reflect the override article rather than the currently
 *     selected one.
 * @return {Number} An indication of reading progress in the book on a 0-1
 *     scale.
 */
TT.chapternav.getProgress = function(overrideArticleId) {
  var selectedArticle = $('#chapter-nav ul li.selected');

  if (overrideArticleId) {
    selectedArticle = $('#chapter-nav ul li').find('[data-article=' +
        overrideArticleId + ']').parent();
  }

  if (TT.navigation.isHomePage() || TT.navigation.isForeword()) {
    return 0;
  }
  else if (TT.navigation.isCreditsPage() || TT.navigation.isLastPage() ||
      selectedArticle.length == 0) {
    return 1;
  }

  return Math.min(selectedArticle.index() /
      ($('#chapter-nav ul li:not(.disabled)').length - 1), 1);
};


/**
 * Click handler for chapter links.
 * @param {Object} event Click event object.
 */
TT.chapternav.onChapterClick = function(event) {

  // Select the related list item.
  var item = $(event.target).is('li') ? $(event.target) :
      $(event.target).parents('li');

  var articleId = $('a', item).attr('data-article');

  if (articleId && !item.hasClass('disabled')) {
    if (TT.navigation.goToPage(articleId, 1)) {
      if (TT.chapternav.getProgress(articleId) > TT.chapternav.getProgress()) {
        TT.paperstack.updateStack(TT.chapternav.getProgress(articleId));
      }

      TT.chapternav.updateSelection(articleId);
    }
  }

  event.preventDefault();
};


/**
 * Mouse over handler for chapter link.
 * @param {Object} event Mouse event object.
 */
TT.chapternav.onChapterMouseOver = function(event) {

  // Find the related list item.
  var item = $(event.target).is('li') ? $(event.target) :
      $(event.target).parents('li');

  var description = $('div.description', item);

  description.stop(true, false).fadeTo(200, 1);
};


/**
 * Mouseout handler for chapter link.
 * @param {Object} event Mouse event object.
 */
TT.chapternav.onChapterMouseOut = function(event) {

  // Find the related list item
  var item = $(event.target).is('li') ? $(event.target) :
      $(event.target).parents('li');

  var description = $('div.description', item);

  description.fadeTo(200, 0);
};