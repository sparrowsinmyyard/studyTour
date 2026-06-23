
        const modal = document.getElementById('mega-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const closeBtn = document.querySelector('.modal-close');
        const navLinks = document.querySelectorAll('.top-nav a');

   
const contentData = {
    'about me': {
        title: 'About Me',
        body: `<p>Hiya! I'm Aryan. Long story short, I really like a pretty study timer along with some lofi or music while I study, but the websites I used kept everything other than the bare minimum behind paid walls, which was yuckie.</p>

<p>In between realizing that the internet is free and so am I this summer break, I decided to build this website—a really cute, journey-based study timer (+pomodoro if you use it) with its own quirks and features!</p>

<p>At its core, it is nothing more than a clock, but in its entirety, it is a really pretty (or so I think) railway-travel-based study-timer app where you pick your start and end destinations (I'll keep adding more!), let it begin, and watch it go as you study or do your own task! Pretty cool, right? :p</p>

<p>Nothing is paid—hell no, no sign-up BS. Use it as you want; you are entirely in control of every feature I add.</p>

<p>I hope you enjoy using it as much as I enjoyed building it! :D</p>`
               
    },
    'other': {
        title: 'studyTour',
        body: `<p>here's how to use it! (although, just get started... you'll figure it out yourself I believe in you!)</p>
               <p></p>`
    },
    'ideas': {
        title: 'Ideas & Projects',
        body: `<p>Sooo here's the deal, right—I keep building random stuff. For this project in particular, my biggest motivation was pure spite. Take a guess: how many paid websites would I have been at to take it upon my own hands lulz?</p>

<p>BUT other than that, I still enjoy building stuff in general in my free time. If you have ideas, let's discuss some! I will link my completed projects here if I deem them fit to the persona of this website! (Hoping you're a rich person and hire me) (that's a joke). But hey, like always—have an awesome day! ❤</p>`
    }
};

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); 
                const key = link.textContent.trim().toLowerCase(); 

                if (contentData[key]) {
                    modalTitle.innerHTML = contentData[key].title;
                    modalBody.innerHTML = contentData[key].body;
                    
                    modal.classList.add('is-active');
                }
            });
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('is-active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('is-active');
            }
        });
    