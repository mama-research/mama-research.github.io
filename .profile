
#test -z "$PROFILEREAD" && . /etc/profile || true

#export LANG=de_DE.UTF-8	# uncomment this line for German output
#export LANG=fr_FR.UTF-8	# uncomment this line for French output
export LANG=es_ES.UTF-8	# uncomment this line for Spanish output


#--------------------------------------------------------#

set -o vi           # enable the ability to recall previous commands with 
PS1='$PWD> '        # set the prompt to display the current directory

#---------------------------------#
#  a few Korn/Bash shell aliases  #
#---------------------------------#

#alias lm="ls -al | more"
#alias dirs="ls -al | grep '^d'"     # show the dir's in the current dir

# mimick a few DOS commands with these aliases:

alias dir="ls -al"
