"use strict";
$(() => {
  const animationEnd     = 'animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd'
  const transitionEnd    = 'webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd'
  const visibilitychange = 'visibilitychange webkitvisibilitychange'

  function documentHidden() {
    document.hidden || document.webkitHidden
  }
  
  function getQueryVariable(variable) {
    let res = null
    const query = window.location.search.substring(1)
    const vars = query.split('&')

    for(let i = 0; i < vars.length; i++) {
      let pair = vars[i].split('=')
      if(pair[0] === variable)
        res = pair[1]
    }
    return res
  }

  function volume() {
    return getQueryVariable('volume') || 1
  }

  function crawl(messages) {
    let counter = 0
    function delay() {
      const lastMessageDivHeight = $('.content:last').height()
      return 1000 + 500 * lastMessageDivHeight / 18
    }
    if(messages.length > 0) {
      if(documentHidden()) {
        setTimeout(() => crawl(messages), delay())
      } else {
        $('.plane').append($('<div>', {class: 'content'}).text(messages[0]))
        setTimeout(() => crawl(messages.slice(counter)), delay())
        ++counter
      }
    } else {
      counter = 0
    }
  }

  function playCommit(messages) {
    $('#theme').prop('volume', volume()).get(0).play()
    crawl(messages)
  } 

  function playError() {
    $('#imperial_march').prop('volume', volume()).get(0).play()
    crawl(["Tun dun dun, da da dun, da da dun ...", "Couldn't find the repo, the repo!"])
  }

  function commitsLink(repo) {
    const userSlashRepo = repo.replace(/.*github.com[\/:](.*?)(\.git)?$/, '$1')
    return {
      url: `https://api.github.com/repos/${userSlashRepo}/commits?per_page=100`,
      hashTag: `#${userSlashRepo}`
    }
  }
  

  function getRepoUrlFromHash() {
    const match = window.location.hash.match(/#(.*?)\/(.*?)$/)
    if(match) {
      return `https://api.github.com/repos/${match[1]}/${match[2]}/commits`
    }
  }

  function showResponse() {
    $('.plane').show()
    commitsFetch.done((response) => {
      if(response.data instanceof Array) {
        const messages = response.data.map(record => record.commit.message)
        playCommit(messages)
      } else {
        console.log(response)
        playError()
      }
    }).fail((problem) => {
      console.log(problem)
      playError()
    })
  }
  
  function createAudioTagFor(fileName, options = {}) {
    let looped = options.looped;
    if(typeof looped === 'undefined') looped = true;

    const sourcePrefix =
      (window.location.hostname == 'localhost')
        ? ''
        : 'https://dl.dropboxusercontent.com/u/362737/starlogs.net/'

    const tag = $('<audio>', {id: fileName, loop: looped})

    const mp3Source = $('<source>', {src: `${sourcePrefix}assets/${fileName}.mp3`, type: 'audio/mp3'})
    const oggSource = $('<source>', {src: `${sourcePrefix}assets/${fileName}.ogg`, type: 'audio/ogg'})

    tag.append(mp3Source).append(oggSource).appendTo($('body'))
  }

  $(document).on('animationEnd', '.content', function() {
    $(this).remove()
  })

  $(window).on('hashchange', () => {
    window.location.reload()
  })

  createAudioTagFor('theme')
  createAudioTagFor('imperial_march')
  createAudioTagFor('falcon_fly', {looped: false})

  let commitsFetch = null

  const url = getRepoUrlFromHash()
  if(url) {
    commitsFetch = $.ajax(url, {dataType: 'jsonp'})
    showResponse()
  } else {
    $('.input').on('transitionEnd', () => showResponse())

    $('input').keyup(function(event) {
      if(event.keyCode === 13) {
        const repo = commitsLink($(this).val())

        window.history.pushState(null, null, `${repo.hashTag}`)
        commitsFetch = $.ajax(repo.url, {dataType: 'jsonp'})

        $('#falcon_fly').prop('volume', volume()).get(0).play()
        $(this).parent().addClass('zoomed')
      }
    })

    $('.input').show()
  }
  $(document).on('visibilitychange', () => {
    if(documentHidden())
      $('.content').addClass('paused')
    else
      $('.content').removeClass('paused')
  })
})
