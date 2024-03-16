export const GETHomePage = (req, res) => {
    const pageTitle = 'home';
    res.render('home/home', { pageTitle });
}