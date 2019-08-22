require "json"

package = JSON.parse(File.read(File.join(__dir__, "/package.json")))

Pod::Spec.new do |s|
  s.name           = "RNAudioRecorderPlayer"
  s.version        = package["version"]
  s.summary        = "This is a react-native link module for audio recorder and player. This is not a playlist audio module and this library provides simple recorder and player functionalities for both android and ios platforms. This only supports default file extension for each platform. This module can also handle file from url."
  s.author         = "doobolab <doobolab@gmail.com> (https://github.com/dooboolab)"

  s.homepage       = "https://github.com/dooboolab/react-native-audio-recorder-player"

  s.license        = "MIT"

  s.ios.deployment_target = "7.0"

  s.source         = { :git => "https://github.com/dooboolab/react-native-audio-recorder-player.git", :tag => "#{s.version}" }
  s.source_files   = "ios/**/*.{h,m}"
  s.preserve_paths = "**/*.js"
  # s.requires_arc   = true

  s.dependency "React"
end
