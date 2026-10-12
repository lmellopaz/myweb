(function($) {
	"use strict";

	var projectFrame = document.getElementById('project-frame'),
		projectTabs = document.querySelectorAll('.project-tab'),
		reloadButton = document.querySelector('.project-reload'),
		projectLinks = document.querySelectorAll('[data-project-link]');

	if (!projectFrame) {
		return;
	}

	projectTabs.forEach(function(tab) {
		tab.addEventListener('click', function() {
			projectTabs.forEach(function(projectTab) {
				projectTab.classList.remove('is-active');
				projectTab.setAttribute('aria-pressed', 'false');
			});

			tab.classList.add('is-active');
			tab.setAttribute('aria-pressed', 'true');
			projectFrame.src = tab.getAttribute('data-project-src');
		});
	});

	reloadButton.addEventListener('click', function() {
		var activeTab = document.querySelector('.project-tab.is-active');

		if (activeTab) {
			projectFrame.src = activeTab.getAttribute('data-project-src');
		}
	});

	projectLinks.forEach(function(link) {
		link.addEventListener('click', function(event) {
			if (link.getAttribute('href') === '#') {
				event.preventDefault();
			}
		});
	});
}(jQuery));
