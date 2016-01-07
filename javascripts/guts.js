"use strict";

$(function () {
  var animationEnd = 'animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd';
  var transitionEnd = 'webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd';
  var visibilitychange = 'visibilitychange webkitvisibilitychange';

  function documentHidden() {
    document.hidden || document.webkitHidden;
  }

  function getQueryVariable(variable) {
    var res = null;
    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (pair[0] === variable) res = pair[1];
    }
    return res;
  }

  function volume() {
    return getQueryVariable('volume') || 1;
  }

  function crawl(messages) {
    var counter = 0;
    function delay() {
      var lastMessageDivHeight = $('.content:last').height();
      return 1000 + 500 * lastMessageDivHeight / 18;
    }
    if (messages.length > 0) {
      if (documentHidden()) {
        setTimeout(function () {
          return crawl(messages);
        }, delay());
      } else {
        $('.plane').append($('<div>', { class: 'content' }).text(messages[0]));
        setTimeout(function () {
          return crawl(messages.slice(counter));
        }, delay());
        ++counter;
      }
    } else {
      counter = 0;
    }
  }

  function playCommit(messages) {
    $('#theme').prop('volume', volume()).get(0).play();
    crawl(messages);
  }

  function playError() {
    $('#imperial_march').prop('volume', volume()).get(0).play();
    crawl(["Tun dun dun, da da dun, da da dun ...", "Couldn't find the repo, the repo!"]);
  }

  function commitsLink(repo) {
    var userSlashRepo = repo.replace(/.*github.com[\/:](.*?)(\.git)?$/, '$1');
    return {
      url: 'https://api.github.com/repos/' + userSlashRepo + '/commits?per_page=100',
      hash_tag: '#' + userSlashRepo
    };
  }

  function getRepoUrlFromHash() {
    var match = window.location.hash.match(/#(.*?)\/(.*?)$/);
    if (match) {
      return "https://api.github.com/repos/#(match.1)/#(match.2)/commits";
    }
  }

  function showResponse() {
    $('.plane').show();
    commitsFetch.done(function (response) {
      if (response.data instanceof Array) {
        var messages = response.data.map(function (record) {
          return record.commit.message;
        });
        playCommit(messages);
      } else {
        console.log(response);
        playError();
      }
    }).fail(function (problem) {
      console.log(problem);
      playError();
    });
  }

  function createAudioTagFor(fileName) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var looped = options.looped;
    if (typeof looped === 'undefined') looped = true;

    var sourcePrefix = window.location.hostname == 'localhost' ? '' : 'https://dl.dropboxusercontent.com/u/362737/starlogs.net/';

    var tag = $('<audio>', { id: fileName, loop: looped });

    var mp3Source = $('<source>', { src: sourcePrefix + 'assets/' + fileName + '.mp3', type: 'audio/mp3' });
    var oggSource = $('<source>', { src: sourcePrefix + 'assets/' + fileName + '.ogg', type: 'audio/ogg' });

    tag.append(mp3Source).append(oggSource).appendTo($('body'));
  }

  $(document).on('animationEnd', '.content', function () {
    $(this).remove();
  });

  $(window).on('hashchange', function () {
    window.location.reload();
  });

  createAudioTagFor('theme');
  createAudioTagFor('imperial_march');
  createAudioTagFor('falcon_fly', { looped: false });

  var commitsFetch = null;

  var url = getRepoUrlFromHash();
  if (url) {
    commitsFetch = $.ajax(url, { dataType: 'jsonp' });
    showResponse();
  } else {
    $('.input').on('transitionEnd', function () {
      return showResponse();
    });

    $('input').keyup(function (event) {
      if (event.keyCode === 13) {
        var repo = commitsLink($(this).val());

        window.history.pushState(null, null, "#(repo.hash_tag)");
        commitsFetch = $.ajax(repo.url, { dataType: 'jsonp' });

        $('#falcon_fly').prop('volume', volume()).get(0).play();
        $(this).parent().addClass('zoomed');
      }
    });

    $('.input').show();
  }
  $(document).on('visibilitychange', function () {
    if (documentHidden()) $('.content').addClass('paused');else $('.content').removeClass('paused');
  });
});