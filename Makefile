# ==============================================================================
# リリース
# ==============================================================================
#
# package.json の version を単一の真実として管理する。
# manifest.config.ts は package.json の version を参照するため自動的に一致する。
#
# 使い方:
#   make release-patch   # 1.0.0 → 1.0.1
#   make release-minor   # 1.0.0 → 1.1.0
#   make release-major   # 1.0.0 → 2.0.0

# 一部の環境で NODE_OPTIONS に消えた preload(restore-node-options.cjs)への参照が
# 残り node が起動できないことがある。リリース系で node を叩くためここでクリアする。
export NODE_OPTIONS :=

.PHONY: release-patch release-minor release-major changelog

release-patch:
	pnpm version patch --no-git-tag-version
	@$(MAKE) _release-commit-push

release-minor:
	pnpm version minor --no-git-tag-version
	@$(MAKE) _release-commit-push

release-major:
	pnpm version major --no-git-tag-version
	@$(MAKE) _release-commit-push

# 直前のタグからのコミット一覧を表示(Chrome Web Store のリリースノート用)
changelog:
	@PREV=$(shell git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo ""); \
	CURR=$(shell git describe --tags --exact-match HEAD 2>/dev/null || echo "HEAD"); \
	if [ -z "$$PREV" ]; then \
		git log $$CURR --pretty=format:"- %s" | grep -v "^- chore: release"; \
	else \
		git log $$PREV..$$CURR --pretty=format:"- %s" | grep -v "^- chore: release"; \
	fi

_release-commit-push:
	$(eval TAG := v$(shell node -p "require('./package.json').version"))
	git add package.json
	git commit -m "chore: release $(TAG)"
	git tag $(TAG)
	git push && git push origin $(TAG)
	@echo ""
	@echo "=== Chrome Web Store リリースノート ==="
	@$(MAKE) changelog
