1. Install Node.js if you haven't already - https://nodejs.org/

2. Open a command prompt, in the root

3. run: npm install

4. run: npm install -g bower

5. run: bower install

6. run: npm install -g gulp

At this point you are set up with all of the files. Any changes to be made, need to be done
on the files on the /resources directory.

6. For gulp to run as you make changes, install and enable the Live Reload Chrome Extension here:
https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en

7. run: gulp watch

8. If not running watch, onces changes are done, run: gulp

9. The above 2 steps will build all of the files into public_html

10. When committing files, only commit /resources and /public_html. Never commit the entire root
   or the /node_modules directory.



             *     ,MMM8&&&.            *
                  MMMM88&&&&&    .
                 MMMM88&&&&&&&
     *           MMM88&&&&&&&&
                 MMM88&&&&&&&&
                 'MMM88&&&&&&'
                   'MMM8&&&'      *
          |\___/|
          )     (             .              '
         =\     /=
           )===(       *
          /     \
          |     |
         /       \
         \       /
  _/\_/\_/\__  _/_/\_/\_/\_/\_/\_/\_/\_/\_/\_
  |  |  |  |( (  |  |  |  |  |  |  |  |  |  |
  |  |  |  | ) ) |  |  |  |  |  |  |  |  |  |
  |  |  |  |(_(  |  |  |  |  |  |  |  |  |  |
  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |