# cssert – CSS Unit testing

## Make sure your styles don't change when your files do
When working on a large project, you sometimes need to refactor your CSS. If you aren't constantly aware of all the different dependencies, you can end up altering the styles somewhere unexpected. This framework is designed to help you create key test cases linked to your styles. If the tests pass after refactoring, you can be sure your design is intact.

## Design
This works by generating a simple HTML skeleton unit which matches the minimal page structure around the element whose styles you want to test. This unit contains references to your project's CSS. You can then refactor your CSS as much as you like and as long as the styles amount to the same visual appearance, the test will continue to pass.

## Usage
### Generating tests
The easiest way to create test cases is to use the bookmarklet. To generate a test unit, load a page whose styles you want to maintain then run the bookmarklet. If you click on an element, the test case will be generated in the floating panel. You can then either copy and paste this into the test section of the standard test page or drag the icon from the bottom of the panel to your desktop.

### Browser
Open the test page in a browser now and all the tests should pass. You can now refactor your CSS and the tests will let you know if something has changed unexpectedly.

### Command-line
This same test page can also be used with the command-line interface. cssert uses [PhantomJS](http://www.phantomjs.org/) to run the tests in a headless webkit instance so that they can be integrated into an automated build-system.

## Spotting changes
If a test is marked as failed, you can view the current state of the markup and styles in the browser window by clicking
on the test title. When running via command-line, screenshots are saved
of the state the page was in at the time of the test.
