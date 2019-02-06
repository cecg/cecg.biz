<?php

$pages = array(
/*
  'index'   => [
    'title' => 'Home',
    'file'  => 'index.html',
  ],
*/
  'bitcoin' => [
    'title' => 'Bitcoin?',
    'file'  => 'bitcoin.html',
  ],
  'why'     => [
    'title' => 'Why?',
    'file'  => 'why.html',
  ],
  'how'     => [
    'title' => 'How?',
    'file'  => 'how.html',
  ],
  'who'     => [
    'title' => 'Who?',
    'file'  => 'who.html',
  ],
  'projects' => [
    'title' => 'Projects',
    'file'  => 'projects.html',
  ],
);

function render($template_path, array $locals = []) {
  extract($locals, EXTR_OVERWRITE);
  ob_start();
  require $template_path;
  return ob_get_clean();
}

foreach ($pages as $path => $page) {
  $page['path'] = "/$path";
  $page['content'] = @file_get_contents('_' . $page['file']);
  file_put_contents($page['file'], render('_template.php', $page));
}
