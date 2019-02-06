upload:
	rsync -avz ./ cecg@cecg.biz:cecg.biz/ --exclude=.git
