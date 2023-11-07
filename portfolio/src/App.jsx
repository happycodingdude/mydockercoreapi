import { useRef } from 'react';

function App() {
  const refMain = useRef(null);
  const scrollToTop = () => {
    refMain.current.scrollTo(0, 0);
  }

  const toggleDarkMode = () => {
    document.querySelector(':root').classList.toggle('dark');
  }

  return (
    <div className="wrapper" ref={refMain}>
      {/* Navbar */}
      <nav className='
      min-h-[4rem] max-h-[7rem] 
      bg-neutral-100 
      text-[1.5rem]
      sticky top-0
      z-[2]
      flex justify-between items-center
      shadow-[0_3px_5px_var(--box-shadow-color)]
      px-[5px]'>
        <h1>Name</h1>
        <ul className='flex gap-[10px] p-0 m-0 h-[70%]'>
          <div className='flex flex-col justify-between cursor-pointer'>
            <div className='w-[2rem] h-[.3rem] bg-black'></div>
            <div className='w-[2rem] h-[.3rem] bg-black'></div>
            <div className='w-[2rem] h-[.3rem] bg-black'></div>
          </div>
          <div className='flex gap-[10px]'>
            <li><a href='#about' className='relative before:absolute before:bg-red-600 before:bottom-0 before:w-[50%] before:h-[.2rem]'>About</a></li>
            <li><a href='#skills' >Skills</a></li>
            <li><a href='#projects' >Project</a></li>
            <li><a href='#contact' >Contact</a></li>
          </div>
          <div className='relative'>
            <input type='checkbox' id='checkbox' className='absolute opacity-0 peer' onChange={toggleDarkMode} />
            <label for='checkbox' className='
            block
            w-[4.5rem] h-[100%] text-[1.6rem]
            bg-[#00bfff]
            rounded-[1rem]
            relative
            cursor-pointer
            before:w-[1.7rem]
            before:aspect-square
            before:bg-[#ffc228]
            before:rounded-[50%]
            before:absolute
            before:top-[50%]
            before:z-[2]
            before:translate-x-[10%]
            before:translate-y-[-50%]
            before:transition-transform 
            before:duration-[.5s]
            before:peer-checked:translate-x-[2.6rem]
            before:peer-checked:translate-y-[-50%]
            peer-checked:bg-black
            transition-background duration-[.5s]
            ' >
              <i class="fa fa-moon absolute top-[.3rem] left-[.2rem] text-white"></i>
              <i class="fa fa-sun absolute top-[.3rem] right-[.2rem] text-yellow-400"></i>
            </label>
          </div>
        </ul>
      </nav>

      {/* Hero */}
      <section className='hero' id='hero'>
        {/* <div className='profile-image'></div> */}
        <img src='../src/img/hanoi4.jpg' className='profile-image'></img>
        <div className='introduction'>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ut voluptatibus corporis veniam blanditiis nulla eaque facilis et distinctio sit, natus, qui optio magnam, quam repellendus excepturi autem praesentium vero. Distinctio.
        </div>
      </section>

      {/* About */}
      <section className='about' id='about'>
        <h2>About me</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate accusantium, aperiam ipsum optio, quasi quam inventore vel similique cumque rerum tenetur minima deleniti ea omnis cum repellendus harum, expedita ullam!</p>
      </section>

      {/* Skills section */}
      <section className='skills' id='skills'>
        <h2>My top skills</h2>
        <div className='skill-set'>
          <div className='skill'></div>
          <div className='skill'></div>
          <div className='skill'></div>
        </div>
        <div className='skill-set'>
          <div className='skill'></div>
          <div className='skill'></div>
          <div className='skill'></div>
        </div>
      </section>

      {/* Projects section */}
      <section className='projects' id='projects'>
        <h2>My projects</h2>
        <div className='projects-wrapper'>
          <div className='project-content'>
            <div className='project' id='project1'>
              <div className='project-detail'>
                <div className='project-image'></div>
                <h2>Project 1</h2>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                <a href='#' className='live-demo'>Live demo</a>
              </div>
              <a href='#project3' className='fa fa-arrow-left back-project'></a>
              <a href='#project2' className='fa fa-arrow-right next-project'></a>
            </div>
            <div className='project' id='project2'>
              <div className='project-detail'>
                <div className='project-image'></div>
                <h2>Project 2</h2>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                <a href='#' className='live-demo'>Live demo</a>
              </div>
              <a href='#project1' className='fa fa-arrow-left back-project'></a>
              <a href='#project3' className='fa fa-arrow-right next-project'></a>
            </div>
            <div className='project' id='project3'>
              <div className='project-detail'>
                <div className='project-image'></div>
                <h2>Project 3</h2>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                <a href='#' className='live-demo'>Live demo</a>
              </div>
              <a href='#project2' className='fa fa-arrow-left back-project'></a>
              <a href='#project1' className='fa fa-arrow-right next-project'></a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact section */}

      {/* Social accounts - Fixed to the right */}

      {/* Scroll to top */}
      <a href='#' className='fa fa-arrow-up scroll-to-top' onClick={scrollToTop}></a>

      {/* Footer section */}

      {/* Website scripts */}
    </div>
  )
}

export default App
