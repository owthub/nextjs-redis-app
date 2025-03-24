export default function Footer(){
    return <>
        <footer className="bg-dark text-white text-center py-3">
          <div className="container">
            <p className="mb-0">© { new Date().getFullYear() } Employee Manager. All Rights Reserved.</p>
          </div>
        </footer>
    </>
}