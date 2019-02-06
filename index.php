<?php

$path = str_replace('/reboot/', '/', $_SERVER['REQUEST_URI']);

$pages = array(
  '/bitcoin' => array(
    'title'   => 'Bitcoin?',
    'content' => 'bitcoin.html',
  ),
  '/why'     => array(
    'title'   => 'Why?',
    'content' => 'why.html',
  ),
  '/how'     => array(
    'title'   => 'How?',
    'content' => 'how.html',
  ),
  '/who'     => array(
    'title'   => 'Who?',
    'content' => 'who.html',
  ),
  '/projects' => array(
    'title'   => 'Projects',
    'content' => 'projects.html',
  ),
);

$redirects = array(
  /* Legacy routes: */
  '/index.php'         => '/',
  '/index.php/bitcoin' => '/bitcoin',
  '/index.php/why'     => '/why',
  '/index.php/how'     => '/how',
  '/index.php/who'     => '/who',
);

function render($template_path, array $locals = array()) {
  extract($locals, EXTR_OVERWRITE);
  require $template_path;
}

if (isset($redirects[$path])) {
  header('Location: ' . $redirects[$path]);
  die();
}

if ($path == '/') {
  render('home.html');
  die();
}

if (isset($pages[$path])) {
  $page = $pages[$path];
  $page['path'] = $path;
  $page['content'] = @file_get_contents($page['content']);
  render('template.php', $page);
  die();
}

include '404.html';
