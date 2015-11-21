require 'selenium-webdriver'

@browser = Selenium::WebDriver.for :chrome
@browser.navigate.to "localhost:3000"
body = @browser.find_element(:tag_name => 'body')
body.send_keys(:control, 't')

p "total number of windows"
p @browser.window_handles.length
p "printing window ids"
@browser.window_handles.each do  |window|
  p  window
end
@browser.quit