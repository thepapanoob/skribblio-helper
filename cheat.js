class Cheat {
  constructor(serverURI, dbt) {
    console.log(`Setting Server URI: ${serverURI} and DRUCKBETANKUNG: ${dbt}`);
    this.URI = serverURI;
    this.DRUCKBETANKUNG = dbt;

    this.inputChat = document.getElementById('inputChat');
    this.formChat = document.getElementById('formChat');
    this.currentWord = document.getElementById('currentWord');
    const overlayContainer = document.getElementById('overlay').children[0];
    this.solutionWord = overlayContainer.children[0];
    this.wordContainer = overlayContainer.children[2];

    this.createCheatWindow();

    this.currentWordObserver = this.observeDOMNode(this.currentWord, target => {
      const underscoreCount = target.innerHTML.split('_').length - 1;
      if (underscoreCount !== 0 && underscoreCount > 0) {
        let regexUrl = this.URI + target.innerHTML;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', regexUrl, true);
        xhr.onload = event => {
          let answers = JSON.parse(event.target.responseText);
          console.log(`it can be one of the following words: ${answers}`);

          let listItems = '';
          if (answers[0] !== '') {
            answers.forEach(elem => {
              listItems += `<li>${elem}</li>`;
            });
          }
          this.cheatWordContainer.innerHTML = listItems;

          if (this.DRUCKBETANKUNG) {
            this.inputChat.value = answers[0];

            let simulateEvent = document.createEvent('Event');
            simulateEvent.initEvent('submit');
            simulateEvent.delegateTarget = this.formChat;
            this.formChat.dispatchEvent(simulateEvent);
          }
        };
        xhr.send();
      }
    });

    this.solutionWordObserver = this.observeDOMNode(
      this.solutionWord,
      target => {
        const textPhrase = target.innerHTML;
        if (textPhrase === 'Choose a word') {
          this.ownRound = true;

          let randomSelect = 0;
          if (this.DRUCKBETANKUNG) {
            randomSelect = this.randomIntFromInterval(0, 2);
          }

          for (let i = 0; i < this.wordContainer.children.length; i++) {
            let data = new FormData();
            data.append('w', this.wordContainer.children[i].innerHTML);
            if (this.DRUCKBETANKUNG && i === randomSelect) {
              data.append('s', true);
            }

            let xhr = new XMLHttpRequest();
            xhr.open('POST', this.URI, true);
            xhr.onload = () => {
              console.log(
                `inserting: '${this.wordContainer.children[i].innerHTML}'`
              );
            };
            xhr.send(data);
          }

          if (this.DRUCKBETANKUNG) {
            this.wordContainer.children[randomSelect].click();
          }
        } else if (textPhrase.startsWith('The word was: ')) {
          if (this.ownRound) {
            this.ownRound = false;
          } else {
            let data = new FormData();
            data.append('w', textPhrase.split('The word was: ').pop());

            let xhr = new XMLHttpRequest();
            xhr.open('POST', this.URI, true);
            xhr.onload = () => {
              console.log(
                `inserting: '${textPhrase.split('The word was: ').pop()}'`
              );
            };
            xhr.send(data);
          }
        }
      }
    );
  }

  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  createCheatWindow() {
    this.cheatWindow = document.createElement('div');
    this.cheatWindow.style =
      'position: fixed; top: 0; right: 0; background-color: #3C3C3C; width: 250px; padding: 0 25px; color: #F0F;';
    this.cheatWindow.innerHTML =
      '<h2 style="text-align: center;">BobRossHook</h2><span>The word could be one of:</span><ul id="cheatWords" style="padding-left: 25px;"></ul>';
    document.body.appendChild(this.cheatWindow);
    this.cheatWordContainer = document.getElementById('cheatWords');
  }

  observeDOMNode(domNodeObj, callback) {
    let obs = new MutationObserver((mutations, observer) => {
      if (mutations[0].addedNodes.length || mutations[0].removedNodes.length)
        callback(mutations[0].target);
    });

    obs.observe(domNodeObj, { childList: true, subtree: true });
    return obs;
  }
}

// Change the server URI and turn on / off the DRUCKBETANKUNG's modus
let cheato = new Cheat('https://localhost:3000/', false);
