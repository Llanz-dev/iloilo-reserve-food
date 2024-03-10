export const GETHomePage = (req, res) => {
    const pageTitle = 'home';
    res.render('customer/home', { pageTitle });
}