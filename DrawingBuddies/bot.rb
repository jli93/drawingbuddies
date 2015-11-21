require 'selenium-webdriver'



(1..100).each do
	@browser = Selenium::WebDriver.for :chrome
	@browser.manage.window.resize_to(1048, 968)
	@browser.navigate.to "localhost:3000"
	body = @browser.find_element(:tag_name => 'body')
	body.send_keys(:control, 't')
end

=begin
p "total number of windows"
p @browser.window_handles.length = 100
p "printing window ids"
@browser.window_handles.each do  |window|
  p  window
end
=end