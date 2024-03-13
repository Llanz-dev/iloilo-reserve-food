const GETAdminPage = (req, res) => {
    const pageTitle = 'admin';
    res.render('admin/home', { pageTitle });
}

export { GETAdminPage };