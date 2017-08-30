
var app = new Vue({
    el: '#app',
    data: {
        isPlaying: false,
        checkerTimer: {},
        currentTime: 0,
        showQuiz: false,
        isYTReady: false,
        showCorrect: false,
        showIntro: false,
        showPlayer: false,
        showIncorrect: false,
        allComplete: true,
        selectedAnswer: '',
        selectedQuestion: {},
        correctAnswers: 0,
        emailAddresses: [{value:''}],
        player: {},
        
        currentVideo: {},
        videos: [
            {
                title: 'Introduction to Edmodo',
                description: 'Today, we\'lllll guide you through the basics of using Edmodo to help administer your classroom and make life easier. Watch the introduction below before we get started exploring features.',
                //videoId: '-n7E2iyWRG8',
                videoId: 'iZK6si8bcKE',
                completed: false,
                questions: [
                    {
                        text: 'What is this video about?',
                        answers: ['Edmodo', 'Teching Pedagogy', 'Setting up your iMac'],
                        time: 3,
                        correct: 0
                    }
                ]
            },
            {
                title: 'Your Edmodo Account',
                //videoId: 'plJJO8fLWfA',
                videoId: 'iZK6si8bcKE',
                completed: false,
                questions: [
                    {
                        text: 'what am I?',
                        answers: ['a cat', 'a dog', 'a computer program'],
                        time: 3,
                        correct: 2
                    },
                    {
                        text: 'Follow up question?',
                        answers: ['1', '2', '3'],
                        time: 6,
                        correct: 0
                    }
                ]
            }
        ]
    },
    methods: {
        updateVideo: function () {

        },
        startVideo: function(){
            var self = this;
            this.showIntro = false;
            this.showPlayer = true;
            setTimeout(function(){
                self.play();
            },250)
            
        },
        nextVideo: function(){
            for (var i = 0; i < this.videos.length; i++) {
                if (i == this.videos.length - 1) {
                    //All Complete!! do something
                    this.allComplete = true;
                    break;
                } else {
                    //Move to next video
                    this.selectVideo(this.videos[i + 1]);
                    break;
                }
            }
        },
        selectVideo: function (video) {
            clearInterval(this.checkerTimer);
            this.currentVideo = video;

            //remove in progress from other videos
            this.videos.forEach(function(vid){vid.inProgress = false;})
            video.inProgress = true;
            
            //zero out other props
            this.correctAnswers = 0;
            this.showQuiz = false;
            this.showIntro = true;
            this.showPlayer = false;
            this.showCorrect = false;
            this.showIncorrect = false;
            this.selectedAnswer = '';
            this.currentTime = 0;
        },
        play: function () {
            if(this.player && typeof(this.player.playVideo) == 'function' && this.isYTReady){
                this.player.playVideo();
                this.isPlaying = true;
            }else{
                this.reInitPlayer();
            }
        },
        pause: function () {
            this.isPlaying = false;
            this.player.pauseVideo();
            clearInterval(this.checkerTimer);
        },
        updateTime: function () {
            var self = this;
            this.currentTime = Math.ceil(this.player.getCurrentTime());
            this.currentVideo.questions.forEach(function (q) {
                if (q.time == self.currentTime) {
                    self.selectedQuestion = q;
                    self.showQuiz = true;
                    self.pause();
                }
            })
        },
        onPlayerReady: function (event) {
            if(this.showPlayer){
                event.target.playVideo();
            }
        },
        onPlayerStateChange: function (event) {
            if (event.data == YT.PlayerState.PLAYING) {
                this.isPlaying = true;
                this.checkerTimer = setInterval(this.updateTime, 1000);
            }
            if(event.data == YT.PlayerState.ENDED){
                event.target.destroy();
                this.player = undefined;
                this.nextVideo();
                
            }
        },
        rewatch: function () {
            var self = this;
            var qIndex = self.currentVideo.questions.findIndex(function (q) {
                return q == self.selectedQuestion;
            })
            if (qIndex > 0) {
                self.player.seekTo(self.currentVideo.questions[qIndex - 1].time);
                self.play()
            } else {
                //restart from beginning
                self.player.seekTo(0);
                self.play()
            }
            self.selectedAnswer = false;
            self.showQuiz = false;
        },
        submitAnswer: function () {
            var self = this;
            if (self.selectedAnswer === self.selectedQuestion.correct) {
                this.correctAnswers++;
                this.showCorrect = true;
                setTimeout(function () {
                    self.showCorrect = false;
                    self.play();
                    self.showQuiz = false;
                }, 2000)
                //Last question
                if (self.selectedQuestion == self.currentVideo.questions[self.currentVideo.questions.length - 1]) {
                    for (var i = 0; i < self.videos.length; i++) {
                        var vid = self.videos[i];
                        if (vid == self.currentVideo) {
                            vid.completed = true;
                            //Move to next video if none
                           
                        }
                    }
                }
                self.play();
                self.selectedAnswer = '';

            } else {
                self.showIncorrect = true;
            }

        },
        isActive: function (video) {
            return this.currentVideo == video
        },
        reInitPlayer: function(){
            var self = this;
            self.player = new YT.Player('player', {
                height: '100%',
                width: '100%',
                videoId: self.currentVideo.videoId,
                playerVars: {
                    controls: 0,
                    modestbranding: 1,
                    disablekb: 1,
                    showinfo: 0,
                    rel: 0
                },
                events: {
                    'onReady': self.onPlayerReady,
                    'onStateChange': self.onPlayerStateChange
                }
            });
        },
        expandEmails: function(){
            if(this.emailAddresses[this.emailAddresses.length-1].length > 0){
                this.emailAddresses.$set(this.emailAddresses.length,{value:''});
            }
        },
        shareEmails: function(){

            alert('Shared');
        }

    },
    watch: {
        selectedAnswer: function (val, oldval) {
            if (val != oldval) {
                this.showIncorrect = false;
            }
        }
    },
    computed:{
        percentComplete: function(){
            return Math.ceil(this.correctAnswers / this.currentVideo.questions.length * 100) + "%";
        }
    },
    watch:{
        
    },   
    mounted: function () {
        var self = this;
        this.currentVideo = this.videos[0];
        this.videos[0].inProgress = true;
        window.onYouTubeIframeAPIReady = function () {
            self.isYTReady = true;
        }


        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

})

